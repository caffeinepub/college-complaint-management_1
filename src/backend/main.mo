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
  // New: userId-keyed profiles for password-based auth (no II required)
  let userProfilesByUserId = Map.empty<Text, UserProfile>();
  let complaints = Map.empty<Nat, Complaint>();
  // Password storage: userId -> password
  let userPasswords = Map.empty<Text, Text>();
  var nextComplaintId : Nat = 1;

  func isRegistered(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?_) { true };
      case (null) { false };
    };
  };

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

  // ============ PASSWORD MANAGEMENT ============

  // Set password for a userId (first-time setup or update)
  public shared func setUserPassword(userId : Text, password : Text) : async Result<()> {
    let trimmedId = userId.trim(#char ' ');
    if (trimmedId.size() == 0 or password.size() < 6) {
      return #err(#invalidInput);
    };
    userPasswords.add(trimmedId, password);
    #ok(());
  };

  // Verify password for a userId
  public query func verifyUserPassword(userId : Text, password : Text) : async Bool {
    let trimmedId = userId.trim(#char ' ');
    switch (userPasswords.get(trimmedId)) {
      case (?stored) { stored == password };
      case (null) { false };
    };
  };

  // Check if a userId has a password set (i.e., has registered before)
  public query func hasPasswordSet(userId : Text) : async Bool {
    let trimmedId = userId.trim(#char ' ');
    switch (userPasswords.get(trimmedId)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  // ============ PUBLIC REGISTRATION (no Internet Identity required) ============

  // Register a new student or staff using only userId + password (no II)
  public shared func registerUserPublic(userId : Text, name : Text, password : Text, userType : Role.Type) : async Result<Text> {
    let trimmedId = userId.trim(#char ' ');
    let trimmedName = name.trim(#char ' ');

    if (trimmedId.size() < 2 or trimmedName.size() < 2 or password.size() < 6) {
      return #err(#invalidInput);
    };

    // Check if userId already has a password (already registered)
    switch (userPasswords.get(trimmedId)) {
      case (?_) { return #err(#alreadyExists) };
      case (null) {};
    };

    // Store password
    userPasswords.add(trimmedId, password);

    // Store profile in userId-keyed map
    let profile : UserProfile = {
      name = trimmedName;
      role = userType;
      userId = trimmedId;
    };
    userProfilesByUserId.add(trimmedId, profile);

    #ok(trimmedId);
  };

  // ============ PUBLIC COMPLAINT SUBMISSION (no Internet Identity required) ============

  // Submit a complaint using userId + password auth (no II required)
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

    // Verify password
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

    // Use anonymous principal for submittedBy (userId is the real identifier)
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

  // Get complaints by userId + password (no II required)
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

  // ============ REGISTRATION (legacy, II-based) ============

  public shared ({ caller }) func registerUser(userId : Text, name : Text, userType : Role.Type) : async Result<Text> {
    let trimmedUserId = userId.trim(#char ' ');
    let trimmedName = name.trim(#char ' ');

    if (trimmedUserId.size() < 3 or trimmedName.size() < 3) {
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

  // Get user profile by userId - checks userId-keyed map first, then principal-keyed
  public query func getUserProfileByUserId(userId : Text) : async ?UserProfile {
    let trimmedId = userId.trim(#char ' ');
    // Check new userId-keyed map first
    switch (userProfilesByUserId.get(trimmedId)) {
      case (?profile) { return ?profile };
      case (null) {};
    };
    // Fall back to principal-keyed map (legacy)
    let allProfiles = userProfiles.values().toArray();
    allProfiles.find(func(p : UserProfile) : Bool { p.userId == trimmedId });
  };

  public query ({ caller }) func isFirstTimeUser(userId : Text) : async Bool {
    let trimmedId = userId.trim(#char ' ');
    // Check userId-keyed map
    switch (userProfilesByUserId.get(trimmedId)) {
      case (?_) { return false };
      case (null) {};
    };
    // Check principal-keyed map
    let allProfiles = userProfiles.values().toArray();
    let found = allProfiles.find(func(p : UserProfile) : Bool { p.userId == trimmedId });
    switch (found) {
      case (?_) { false };
      case (null) { true };
    };
  };

  // ============ COMPLAINT SUBMISSION (legacy, II-based) ============

  public shared ({ caller }) func submitComplaint(
    submitterName : Text,
    submitterType : Role.Type,
    category : Category.Type,
    title : Text,
    description : Text,
    priority : Priority.Type,
  ) : async Result<Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { return #err(#unauthorized) };
    };

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

  // ============ VIEW OWN COMPLAINTS (legacy, II-based) ============

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
