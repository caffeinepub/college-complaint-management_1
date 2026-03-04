import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Text "mo:core/Text";

module {
  // Old types from the previous actor
  type OldUserProfile = {
    name : Text;
  };

  type OldComplaint = {
    id : Nat;
    submittedBy : Principal;
    submitterName : Text;
    submitterRole : {
      #student;
      #staff;
      #admin;
    };
    category : {
      #academic;
      #infrastructure;
      #facultyConduct;
      #administrative;
      #hostelCanteen;
      #itTechnical;
      #other;
    };
    title : Text;
    description : Text;
    priority : {
      #low;
      #medium;
      #high;
      #urgent;
    };
    status : {
      #open;
      #inProgress;
      #resolved;
      #closed;
    };
    createdAt : Int;
    updatedAt : Int;
    adminResponse : ?Text;
    assignedTo : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    complaints : Map.Map<Nat, OldComplaint>;
    nextComplaintId : Nat;
  };

  // New types for the current actor
  type NewUserProfile = {
    name : Text;
    role : {
      #student;
      #staff;
      #admin;
    };
    userId : Text;
  };

  type NewComplaint = {
    id : Nat;
    referenceNumber : Text;
    submittedBy : Principal;
    submittedByUserId : Text;
    submitterName : Text;
    submitterType : {
      #student;
      #staff;
      #admin;
    };
    category : {
      #academic;
      #infrastructure;
      #facultyConduct;
      #administrative;
      #hostelCanteen;
      #itTechnical;
      #other;
    };
    title : Text;
    description : Text;
    priority : {
      #low;
      #medium;
      #high;
      #urgent;
    };
    status : {
      #open;
      #inProgress;
      #resolved;
      #closed;
    };
    createdAt : Int;
    updatedAt : Int;
    adminResponse : ?Text;
    assignedTo : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    complaints : Map.Map<Nat, NewComplaint>;
    nextComplaintId : Nat;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldProfile) {
        {
          name = oldProfile.name;
          role = #student; // Default to student, needs manual correction if necessary
          userId = "";
        };
      }
    );

    let newComplaints = old.complaints.map<Nat, OldComplaint, NewComplaint>(
      func(_id, oldComplaint) {
        {
          id = oldComplaint.id;
          referenceNumber = "";
          submittedBy = oldComplaint.submittedBy;
          submittedByUserId = "";
          submitterName = oldComplaint.submitterName;
          submitterType = oldComplaint.submitterRole;
          category = oldComplaint.category;
          title = oldComplaint.title;
          description = oldComplaint.description;
          priority = oldComplaint.priority;
          status = oldComplaint.status;
          createdAt = oldComplaint.createdAt;
          updatedAt = oldComplaint.updatedAt;
          adminResponse = oldComplaint.adminResponse;
          assignedTo = oldComplaint.assignedTo;
        };
      }
    );

    {
      userProfiles = newUserProfiles;
      complaints = newComplaints;
      nextComplaintId = old.nextComplaintId;
    };
  };
};
