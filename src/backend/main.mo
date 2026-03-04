import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Role {
    public type Type = {
      #student;
      #staff;
      #admin;
    };

    public func compare(role1 : Type, role2 : Type) : Order.Order {
      switch (role1, role2) {
        case (#admin, #admin) { #equal };
        case (#admin, _) { #less };
        case (#staff, #admin) { #greater };
        case (#staff, #staff) { #equal };
        case (#staff, #student) { #less };
        case (#student, #student) { #equal };
        case (#student, _) { #greater };
      };
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

    public func compare(category1 : Type, category2 : Type) : Order.Order {
      switch (category1, category2) {
        case (#academic, #academic) { #equal };
        case (#academic, _) { #less };
        case (#administrative, #academic) { #greater };
        case (#administrative, #administrative) { #equal };
        case (#administrative, _) { #less };
        case (#facultyConduct, #academic) { #greater };
        case (#facultyConduct, #administrative) { #greater };
        case (#facultyConduct, #facultyConduct) { #equal };
        case (#facultyConduct, _) { #less };
        case (#hostelCanteen, #other) { #less };
        case (#hostelCanteen, #hostelCanteen) { #equal };
        case (#hostelCanteen, _) { #greater };
        case (#infrastructure, #academic) { #greater };
        case (#infrastructure, #administrative) { #greater };
        case (#infrastructure, #infrastructure) { #equal };
        case (#infrastructure, _) { #less };
        case (#itTechnical, #other) { #less };
        case (#itTechnical, #hostelCanteen) { #greater };
        case (#itTechnical, #itTechnical) { #equal };
        case (#other, #other) { #equal };
        case (#other, _) { #greater };
      };
    };
  };

  module Priority {
    public type Type = {
      #low;
      #medium;
      #high;
      #urgent;
    };

    public func compare(priority1 : Type, priority2 : Type) : Order.Order {
      switch (priority1, priority2) {
        case (#low, #low) { #equal };
        case (#low, _) { #less };
        case (#medium, #low) { #greater };
        case (#medium, #medium) { #equal };
        case (#medium, _) { #less };
        case (#high, #urgent) { #less };
        case (#high, #high) { #equal };
        case (#high, _) { #greater };
        case (#urgent, #urgent) { #equal };
        case (#urgent, _) { #greater };
      };
    };
  };

  module Status {
    public type Type = {
      #open;
      #inProgress;
      #resolved;
      #closed;
    };

    public func compare(status1 : Type, status2 : Type) : Order.Order {
      switch (status1, status2) {
        case (#open, #open) { #equal };
        case (#open, _) { #less };
        case (#inProgress, #open) { #greater };
        case (#inProgress, #inProgress) { #equal };
        case (#inProgress, _) { #less };
        case (#resolved, #closed) { #less };
        case (#resolved, #resolved) { #equal };
        case (#resolved, _) { #greater };
        case (#closed, #closed) { #equal };
        case (#closed, _) { #greater };
      };
    };
  };

  public type Complaint = {
    id : Nat;
    submittedBy : Principal;
    submitterName : Text;
    submitterRole : Role.Type;
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

  module Complaint {
    public func compare(complaint1 : Complaint, complaint2 : Complaint) : Order.Order {
      Nat.compare(complaint1.id, complaint2.id);
    };
  };

  let complaints = Map.empty<Nat, Complaint>();
  var nextComplaintId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  public type SubmitComplaintRequest = {
    submitterName : Text;
    submitterRole : Role.Type;
    category : Category.Type;
    title : Text;
    description : Text;
    priority : Priority.Type;
  };

  public type UpdateStatusRequest = {
    id : Nat;
    newStatus : Status.Type;
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

  public type Error = {
    #unauthorized;
    #notFound;
    #invalidInput;
    #internalError;
    #alreadyExists;
  };

  public shared ({ caller }) func submitComplaint(request : SubmitComplaintRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit complaints");
    };

    let id = nextComplaintId;
    nextComplaintId += 1;

    let complaint : Complaint = {
      id;
      submittedBy = caller;
      submitterName = request.submitterName;
      submitterRole = request.submitterRole;
      category = request.category;
      title = request.title;
      description = request.description;
      priority = request.priority;
      status = #open;
      createdAt = Time.now();
      updatedAt = Time.now();
      adminResponse = null;
      assignedTo = null;
    };

    complaints.add(id, complaint);
    id;
  };

  public query ({ caller }) func getMyComplaints() : async [Complaint] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their complaints");
    };

    complaints.values().toArray().filter(
      func(complaint) {
        complaint.submittedBy == caller
      }
    );
  };

  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all complaints");
    };

    complaints.values().toArray();
  };

  public shared ({ caller }) func updateComplaintStatus(request : UpdateStatusRequest) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update complaint status");
    };

    switch (complaints.get(request.id)) {
      case (?complaint) {
        let updatedComplaint : Complaint = {
          id = complaint.id;
          submittedBy = complaint.submittedBy;
          submitterName = complaint.submitterName;
          submitterRole = complaint.submitterRole;
          category = complaint.category;
          title = complaint.title;
          description = complaint.description;
          priority = complaint.priority;
          status = request.newStatus;
          createdAt = complaint.createdAt;
          updatedAt = Time.now();
          adminResponse = request.adminResponse;
          assignedTo = request.assignedTo;
        };

        complaints.add(request.id, updatedComplaint);
      };
      case (null) {
        Runtime.trap("Complaint not found");
      };
    };
  };

  public query ({ caller }) func getComplaintStats() : async ComplaintStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };

    let allComplaints = complaints.values().toArray();
    let total = allComplaints.size();

    let open = allComplaints.filter(
      func(c) {
        c.status == #open;
      }
    ).size();

    let inProgress = allComplaints.filter(
      func(c) {
        c.status == #inProgress;
      }
    ).size();

    let resolved = allComplaints.filter(
      func(c) {
        c.status == #resolved;
      }
    ).size();

    let closed = allComplaints.filter(
      func(c) {
        c.status == #closed;
      }
    ).size();

    {
      total;
      open;
      inProgress;
      resolved;
      closed;
    };
  };

  public query ({ caller }) func getComplaintById(id : Nat) : async ?Complaint {
    switch (complaints.get(id)) {
      case (?complaint) {
        if (complaint.submittedBy == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?complaint;
        } else {
          Runtime.trap("Unauthorized: Can only view your own complaints");
        };
      };
      case (null) {
        null;
      };
    };
  };
};
