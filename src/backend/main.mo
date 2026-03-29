import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type AcademicData = Text;

  let records = Map.empty<Principal, AcademicData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Semester config types
  public type HolidayEntry = {
    date : Text;
    name : Text;
  };

  public type EventEntry = {
    date : Text;
    name : Text;
    eventType : Text;
  };

  public type SlotExamDates = {
    quiz1 : Text;
    quiz2 : Text;
    endSem : Text;
  };

  public type SemesterConfig = {
    id : Text;
    semName : Text;
    year : Nat;
    semType : Text;
    classStart : Text;
    classEnd : Text;
    quiz1Start : Text;
    quiz1End : Text;
    quiz2Start : Text;
    quiz2End : Text;
    endSemStart : Text;
    endSemEnd : Text;
    holidays : [HolidayEntry];
    events : [EventEntry];
    slotExamDates : [(Text, SlotExamDates)];
    isActive : Bool;
  };

  let semesterConfigs = Map.empty<Text, SemesterConfig>();

  // Required user profile functions
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

  // Academic data functions
  public query ({ caller }) func getCallerSnapshot() : async ?AcademicData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access academic data");
    };
    records.get(caller);
  };

  public shared ({ caller }) func saveCallerSnapshot(snapshot : AcademicData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save academic data");
    };
    records.add(caller, snapshot);
  };

  // Semester config functions (admin-only writes, public reads)
  public shared ({ caller }) func saveSemesterConfig(config : SemesterConfig) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can save semester configs");
    };
    semesterConfigs.add(config.id, config);
  };

  public query func getSemesterConfigs() : async [SemesterConfig] {
    semesterConfigs.values().toArray();
  };

  public query func getActiveSemesterConfig() : async ?SemesterConfig {
    for (cfg in semesterConfigs.values()) {
      if (cfg.isActive) return ?cfg;
    };
    null;
  };

  public shared ({ caller }) func setActiveSemester(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set active semester");
    };
    let keys = semesterConfigs.keys().toArray();
    for (key in keys.vals()) {
      switch (semesterConfigs.get(key)) {
        case (?cfg) {
          let updated : SemesterConfig = {
            id = cfg.id;
            semName = cfg.semName;
            year = cfg.year;
            semType = cfg.semType;
            classStart = cfg.classStart;
            classEnd = cfg.classEnd;
            quiz1Start = cfg.quiz1Start;
            quiz1End = cfg.quiz1End;
            quiz2Start = cfg.quiz2Start;
            quiz2End = cfg.quiz2End;
            endSemStart = cfg.endSemStart;
            endSemEnd = cfg.endSemEnd;
            holidays = cfg.holidays;
            events = cfg.events;
            slotExamDates = cfg.slotExamDates;
            isActive = key == id;
          };
          semesterConfigs.add(key, updated);
        };
        case null {};
      };
    };
  };

  public shared ({ caller }) func deleteSemesterConfig(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete semester configs");
    };
    ignore semesterConfigs.remove(id);
  };
};
