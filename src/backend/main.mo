import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import VarArray "mo:core/VarArray";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
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
  let userProfilesByUserId = Map.empty<Text, UserProfile>();
  let complaints = Map.empty<Nat, Complaint>();
  let userPasswords = Map.empty<Text, Text>();
  var nextComplaintId : Nat = 1;

  let ADMIN_PASSWORD = "admin123";

  func formatReferenceNumber(id : Nat) : Text {
    let idText = id.toText();
    let padding = if (idText.size() < 6) {
      Text.fromVarArray(VarArray.repeat('0', 6 - idText.size()));
    } else {
      "";
    };
    "ADITYA#" # padding # idText;
  };

  // ============ PASSWORD MANAGEMENT ============

  public shared func setUserPassword(userId : Text, password : Text) : async Result<()> {
    let trimmedId = userId.trim(#char ' ');
    if (trimmedId.size() == 0 or password.size() < 6) {
      return #err(#invalidInput);
    };
    userPasswords.add(trimmedId, password);
    #ok(());
  };

  public query func verifyUserPassword(userId : Text, password : Text) : async Bool {
    let trimmedId = userId.trim(#char ' ');
    switch (userPasswords.get(trimmedId)) {
      case (?stored) { stored == password };
      case (null) { false };
    };
  };

  public query func hasPasswordSet(userId : Text) : async Bool {
    let trimmedId = userId.trim(#char ' ');
    switch (userPasswords.get(trimmedId)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  // ============ PUBLIC REGISTRATION (no Internet Identity required) ============

  public shared func registerUserPublic(userId : Text, name : Text, password : Text, userType : Role.Type) : async Result<Text> {
    let trimmedId = userId.trim(#char ' ');
    let trimmedName = name.trim(#char ' ');

    if (trimmedId.size() < 2 or trimmedName.size() < 2 or password.size() < 6) {
      return #err(#invalidInput);
    };

    switch (userPasswords.get(trimmedId)) {
      case (?_) { return #err(#alreadyExists) };
      case (null) {};
    };

    userPasswords.add(trimmedId, password);

    let profile : UserProfile = {
      name = trimmedName;
      role = userType;
      userId = trimmedId;
    };
    userProfilesByUserId.add(trimmedId, profile);

    #ok(trimmedId);
  };

  // ============ PUBLIC COMPLAINT SUBMISSION ============

  public shared func submitComplaintPublic(
    userId : Text,
    password : Text,
    submitterName : Text,
    submitterType : Role.Type,
    category : Category.Type,
    title : Text,
    description : Text,
    priority : Priority.Type,
  ) : async Result<Text> {
    let trimmedId = userId.trim(#char ' ');

    switch (userPasswords.get(trimmedId)) {
      case (?stored) {
        if (stored != password) return #err(#unauthorized);
      };
      case (null) { return #err(#unauthorized) };
    };

    if (title.size() == 0 or description.size() == 0) {
      return #err(#invalidInput);
    };

    let id = nextComplaintId;
    nextComplaintId += 1;
    let referenceNumber = formatReferenceNumber(id);
    let anonPrincipal = Principal.fromText("2vxsx-fae");

    let complaint : Complaint = {
      id;
      referenceNumber;
      submittedBy = anonPrincipal;
      submittedByUserId = trimmedId;
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

  public query func getComplaintsByUserId(userId : Text, password : Text) : async Result<[Complaint]> {
    let trimmedId = userId.trim(#char ' ');

    switch (userPasswords.get(trimmedId)) {
      case (?stored) {
        if (stored != password) return #err(#unauthorized);
      };
      case (null) { return #err(#unauthorized) };
    };

    let filtered = complaints.values().toArray().filter(
      func(c : Complaint) : Bool { c.submittedByUserId == trimmedId }
    );
    #ok(filtered);
  };

  // ============ USER PROFILE MANAGEMENT ============

  // FIXED: returns null instead of trapping for unauthorized callers
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  // FIXED: returns null instead of trapping
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // ============ REGISTRATION (II-based) ============

  public shared ({ caller }) func registerUser(userId : Text, name : Text, userType : Role.Type) : async Result<Text> {
    let trimmedUserId = userId.trim(#char ' ');
    let trimmedName = name.trim(#char ' ');

    if (trimmedUserId.size() < 2 or trimmedName.size() < 2) {
      return #err(#invalidInput);
    };

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
    #ok(trimmedUserId);
  };

  // ============ USER INFO ============

  public query ({ caller }) func getUserInfo() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getUserProfileByUserId(userId : Text) : async ?UserProfile {
    let trimmedId = userId.trim(#char ' ');
    switch (userProfilesByUserId.get(trimmedId)) {
      case (?profile) { return ?profile };
      case (null) {};
    };
    let allProfiles = userProfiles.values().toArray();
    allProfiles.find(func(p : UserProfile) : Bool { p.userId == trimmedId });
  };

  public query func isFirstTimeUser(userId : Text) : async Bool {
    let trimmedId = userId.trim(#char ' ');
    switch (userProfilesByUserId.get(trimmedId)) {
      case (?_) { return false };
      case (null) {};
    };
    let allProfiles = userProfiles.values().toArray();
    let found = allProfiles.find(func(p : UserProfile) : Bool { p.userId == trimmedId });
    switch (found) {
      case (?_) { false };
      case (null) { true };
    };
  };

  // ============ COMPLAINT SUBMISSION (II-based) ============

  public shared ({ caller }) func submitComplaint(
    submitterName : Text,
    submitterType : Role.Type,
    category : Category.Type,
    title : Text,
    description : Text,
    priority : Priority.Type,
  ) : async Result<Text> {
    // Check that caller has a registered profile (not anonymous)
    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { return #err(#unauthorized) };
    };

    if (title.size() == 0 or description.size() == 0) {
      return #err(#invalidInput);
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

  // ============ VIEW OWN COMPLAINTS (II-based) ============

  public query ({ caller }) func getMyComplaints() : async Result<[Complaint]> {
    switch (userProfiles.get(caller)) {
      case (null) { return #err(#unauthorized) };
      case (?_) {};
    };
    let filteredComplaints = complaints.values().toArray().filter(
      func(complaint : Complaint) : Bool { complaint.submittedBy == caller }
    );
    #ok(filteredComplaints);
  };

  public query ({ caller }) func getMyComplaintCount() : async Result<Nat> {
    switch (userProfiles.get(caller)) {
      case (null) { return #err(#unauthorized) };
      case (?_) {};
    };
    let count = complaints.values().toArray().filter(
      func(complaint : Complaint) : Bool { complaint.submittedBy == caller }
    ).size();
    #ok(count);
  };

  // ============ ADMIN: VIEW ALL COMPLAINTS (II-based) ============

  public query ({ caller }) func getAllComplaints() : async Result<[Complaint]> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err(#unauthorized);
    };
    #ok(complaints.values().toArray());
  };

  // ============ ADMIN: VIEW ALL COMPLAINTS (password-based, for non-II admin) ============

  public query func getAllComplaintsAdmin(adminPassword : Text) : async Result<[Complaint]> {
    if (adminPassword != ADMIN_PASSWORD) {
      return #err(#unauthorized);
    };
    #ok(complaints.values().toArray());
  };

  public query func getComplaintStatsAdmin(adminPassword : Text) : async Result<ComplaintStats> {
    if (adminPassword != ADMIN_PASSWORD) {
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

  // ============ ADMIN: UPDATE COMPLAINT STATUS (password-based) ============

  public shared func updateComplaintStatusAdmin(
    adminPassword : Text,
    complaintId : Nat,
    newStatus : Status.Type,
    adminResponse : ?Text,
    assignedTo : ?Text,
  ) : async Result<{}> {
    if (adminPassword != ADMIN_PASSWORD) {
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

  // ============ ADMIN: GET COMPLAINT STATS (II-based) ============

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
    switch (complaints.get(id)) {
      case (?complaint) {
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
