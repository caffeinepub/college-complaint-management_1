import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import VarArray "mo:core/VarArray";
import Char "mo:core/Char";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// apply data migration in special with-clause

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Result<T> = {
    #ok : T;
    #err : {
      #unauthorized;
      #notFound;
      #alreadyExists;
      #invalidInput;
      #internalError;
    };
  };

  module Role {
    public type Type = {
      #student;
      #staff;
      #admin;
    };
  };

  module Category {
    public type Type = {
      #academic;
      #infrastructure;
      #facultyConduct;
      #administrative;
      #hostelCanteen;
      #itTechnical;
      #other;
    };
  };

  module Priority {
    public type Type = {
      #low;
      #medium;
      #high;
      #urgent;
    };
  };

  module Status {
    public type Type = {
      #open;
      #inProgress;
      #resolved;
      #closed;
    };
  };

  public type UserProfile = {
    name : Text;
    role : Role.Type;
    userId : Text;
  };

  public type Complaint = {
    id : Nat;
    referenceNumber : Text;
    submittedBy : Principal;
    submittedByUserId : Text;
    submitterName : Text;
    submitterType : Role.Type;
    category : Category.Type;
    title : Text;
    description : Text;
    priority : Priority.Type;
    status : Status.Type;
    createdAt : Int;
    updatedAt : Int;
    adminResponse : ?Text;
    assignedTo : ?Text;
  };

  public type ComplaintStats = {
    total : Nat;
    open : Nat;
    inProgress : Nat;
    resolved : Nat;
    closed : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let complaints = Map.empty<Nat, Complaint>();
  var nextComplaintId : Nat = 1;

  // Helper function to check if user has a profile (registered)
  func isRegistered(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  // Helper function to get user profile
  func getUserProfileInternal(caller : Principal) : ?UserProfile {
    userProfiles.get(caller);
  };

  func formatReferenceNumber(id : Nat) : Text {
    let idText = id.toText();
    let padding = if (idText.size() < 6) {
      Text.fromVarArray(VarArray.repeat('0', 6 - idText.size()));
    } else {
      "";
    };
    "ADITYA#" # padding # idText;
  };

  // ============ USER PROFILE MANAGEMENT ============

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ============ REGISTRATION ============

  public shared ({ caller }) func registerUser(userId : Text, name : Text, userType : Role.Type) : async Result<Text> {
    let trimmedUserId = userId.trim(#char ' ');
    let trimmedName = name.trim(#char ' ');

    if (trimmedUserId.size() < 3 or trimmedName.size() < 3) {
      return #err(#invalidInput);
    };

    // Check if already registered
    switch (userProfiles.get(caller)) {
      case (?_) {
        return #err(#alreadyExists);
      };
      case (null) {};
    };

    let profile : UserProfile = {
      name = trimmedName;
      role = userType;
      userId = trimmedUserId;
    };

    userProfiles.add(caller, profile);

    // Assign appropriate role in AccessControl
    let accessRole = switch (userType) {
      case (#admin) { #admin };
      case (#staff) { #user };
      case (#student) { #user };
    };
    AccessControl.assignRole(accessControlState, caller, caller, accessRole);

    #ok(trimmedUserId);
  };

  // ============ USER INFO ============

  public query ({ caller }) func getUserInfo() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func isFirstTimeUser(userId : Text) : async Bool {
    // Anyone can check if a userId is registered (for registration flow)
    // This is safe as it only reveals if a userId exists, not sensitive data
    let allProfiles = userProfiles.values().toArray();
    let found = allProfiles.find(func(p) { p.userId == userId });
    switch (found) {
      case (?_) { false };
      case (null) { true };
    };
  };

  // ============ COMPLAINT SUBMISSION ============

  public shared ({ caller }) func submitComplaint(
    submitterName : Text,
    submitterType : Role.Type,
    category : Category.Type,
    title : Text,
    description : Text,
    priority : Priority.Type,
  ) : async Result<Text> {
    // Only registered users can submit complaints
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    // Verify user is registered
    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { return #err(#unauthorized) };
    };

    // Admins should not submit complaints as students/staff
    if (AccessControl.isAdmin(accessControlState, caller) and submitterType != #admin) {
      return #err(#unauthorized);
    };

    let id = nextComplaintId;
    nextComplaintId += 1;

    let referenceNumber = formatReferenceNumber(id);

    let complaint : Complaint = {
      id;
      referenceNumber;
      submittedBy = caller;
      submittedByUserId = userProfile.userId;
      submitterName;
      submitterType;
      category;
      title;
      description;
      priority;
      status = #open;
      createdAt = Time.now();
      updatedAt = Time.now();
      adminResponse = null;
      assignedTo = null;
    };

    complaints.add(id, complaint);
    #ok(referenceNumber);
  };

  // ============ VIEW OWN COMPLAINTS ============

  public query ({ caller }) func getMyComplaints() : async Result<[Complaint]> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    let filteredComplaints = complaints.values().toArray().filter(
      func(complaint : Complaint) : Bool { complaint.submittedBy == caller }
    );
    #ok(filteredComplaints);
  };

  public query ({ caller }) func getMyComplaintCount() : async Result<Nat> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    let count = complaints.values().toArray().filter(
      func(complaint : Complaint) : Bool { complaint.submittedBy == caller }
    ).size();
    #ok(count);
  };

  // ============ ADMIN: VIEW ALL COMPLAINTS ============

  public query ({ caller }) func getAllComplaints() : async Result<[Complaint]> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err(#unauthorized);
    };

    #ok(complaints.values().toArray());
  };

  // ============ ADMIN: UPDATE COMPLAINT STATUS ============

  public shared ({ caller }) func updateComplaintStatus(
    complaintId : Nat,
    newStatus : Status.Type,
    adminResponse : ?Text,
    assignedTo : ?Text,
  ) : async Result<{}> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err(#unauthorized);
    };

    switch (complaints.get(complaintId)) {
      case (?complaint) {
        let updatedComplaint : Complaint = {
          id = complaint.id;
          referenceNumber = complaint.referenceNumber;
          submittedBy = complaint.submittedBy;
          submittedByUserId = complaint.submittedByUserId;
          submitterName = complaint.submitterName;
          submitterType = complaint.submitterType;
          category = complaint.category;
          title = complaint.title;
          description = complaint.description;
          priority = complaint.priority;
          status = newStatus;
          createdAt = complaint.createdAt;
          updatedAt = Time.now();
          adminResponse;
          assignedTo;
        };

        complaints.add(complaintId, updatedComplaint);
        #ok({});
      };
      case (null) {
        #err(#notFound);
      };
    };
  };

  // ============ ADMIN: GET COMPLAINT STATS ============

  public query ({ caller }) func getComplaintStats() : async Result<ComplaintStats> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err(#unauthorized);
    };

    let allComplaints = complaints.values().toArray();
    let stats : ComplaintStats = {
      total = allComplaints.size();
      open = allComplaints.filter(func(c : Complaint) : Bool { c.status == #open }).size();
      inProgress = allComplaints.filter(func(c : Complaint) : Bool { c.status == #inProgress }).size();
      resolved = allComplaints.filter(func(c : Complaint) : Bool { c.status == #resolved }).size();
      closed = allComplaints.filter(func(c : Complaint) : Bool { c.status == #closed }).size();
    };
    #ok(stats);
  };

  // ============ GET COMPLAINT BY ID ============

  public query ({ caller }) func getComplaintById(id : Nat) : async Result<Complaint> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    switch (complaints.get(id)) {
      case (?complaint) {
        // Users can only view their own complaints, admins can view all
        if (complaint.submittedBy == caller or AccessControl.isAdmin(accessControlState, caller)) {
          #ok(complaint);
        } else {
          #err(#unauthorized);
        };
      };
      case (null) {
        #err(#notFound);
      };
    };
  };
};
