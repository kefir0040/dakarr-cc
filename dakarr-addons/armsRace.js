const {
  dereference,
  combineStats,
  makeDeco,
  makeAuto,
  makeBird,
  makeOver,
  addBackGunner,
  weaponArray,
} = require("../facilitators.js");
const {
  base,
  gunCalcNames,
  statnames,
  dfltskl,
  smshskl,
} = require("../constants.js");
const g = require("../gunvals.js");
Class.AR_placeholder = {
  LABEL: "PLACEHOLDER",
  COLOR: "black",
  UPGRADE_COLOR: "black",
};

// YES I KNOW THE LINE COUNT IS RIDICULOUS I'LL IMPROVE IT LATER OK - zenphia
// return

/** MAIN VARIABLES **/
// Set this to false to disable desmos branch
const desmosAllowed = true;
//Set this to false to enable undertow
const noUndertow = true;

/** GUNVALS **/
g.diesel = {
  reload: 0.375,
  recoil: 0.8,
  shudder: 1.2,
  size: 0.625,
  health: 0.95,
  damage: 0.9,
  maxSpeed: 0.8,
  spray: 1.3,
};

// Cannon Functions
const makeMulti = (type, count, name = -1, delayIncrement = 0) => {
  type = ensureIsClass(type);
  let greekNumbers =
      ",Double ,Triple ,Quad ,Penta ,Hexa ,Septa ,Octo ,Nona ,Deca ,Hendeca ,Dodeca ,Trideca ,Tetradeca ,Pentadeca ,Hexadeca ,Septadeca ,Octadeca ,Nonadeca ,Icosa ,Henicosa ,Doicosa ,Triaicosa ,Tetraicosa ,Pentaicosa ,Hexaicosa ,Septaicosa ,Octoicosa ,Nonaicosa ,Triaconta ".split(
        ","
      ),
    output = dereference(type),
    fraction = 360 / count;
  output.GUNS = weaponArray(type.GUNS, count, delayIncrement);
  output.LABEL =
    name === -1 ? (greekNumbers[count - 1] || count + " ") + type.LABEL : name;
  return output;
};
const makeFighter = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type);
  let cannons = [
    {
      POSITION: [16, 8, 1, 0, -1, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flankGuard,
          g.triAngle,
          g.triAngleFront,
        ]),
        TYPE: "bullet",
        LABEL: "Side",
      },
    },
    {
      POSITION: [16, 8, 1, 0, 1, -90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flankGuard,
          g.triAngle,
          g.triAngleFront,
        ]),
        TYPE: "bullet",
        LABEL: "Side",
      },
    },
  ];
  output.GUNS = type.GUNS == null ? cannons : type.GUNS.concat(cannons);
  output.LABEL = name == -1 ? "Fighter " + type.LABEL : name;
  return output;
};
const makeSurfer = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type);
  let cannons = [
    {
      POSITION: [7, 7.5, 0.6, 7, -1, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: "autoswarm",
        STAT_CALCULATOR: "swarm",
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, 1, -90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: "autoswarm",
        STAT_CALCULATOR: "swarm",
      },
    },
  ];
  output.GUNS = type.GUNS == null ? cannons : type.GUNS.concat(cannons);
  output.LABEL = name == -1 ? "Surfer " + type.LABEL : name;
  return output;
};
const makeSuperbird = (
  type,
  name = -1,
  frontRecoilFactor = 1,
  backRecoilFactor = 1,
  color
) => {
  type = ensureIsClass(type);
  let output = dereference(type);
  // Thrusters
  let backRecoil = 0.5 * backRecoilFactor;
  let thrusterProperties = {
    SHOOT_SETTINGS: combineStats([
      g.basic,
      g.flankGuard,
      g.triAngle,
      g.thruster,
      { recoil: backRecoil },
    ]),
    TYPE: "bullet",
    LABEL: "thruster",
  };
  let shootyBois = [
    {
      POSITION: [14, 8, 1, 0, 0, 130, 0.6],
      PROPERTIES: thrusterProperties,
    },
    {
      POSITION: [14, 8, 1, 0, 0, -130, 0.6],
      PROPERTIES: thrusterProperties,
    },
    {
      POSITION: [16, 8, 1, 0, 0, 150, 0.1],
      PROPERTIES: thrusterProperties,
    },
    {
      POSITION: [16, 8, 1, 0, 0, -150, 0.1],
      PROPERTIES: thrusterProperties,
    },
    {
      POSITION: [18, 8, 1, 0, 0, 180, 0.35],
      PROPERTIES: thrusterProperties,
    },
  ];
  // Assign thruster color
  if (color)
    for (let gun of shootyBois) {
      gun.PROPERTIES.TYPE = [gun.PROPERTIES.TYPE, { COLOR: color }];
    }

  // Modify front barrels
  for (let gun of output.GUNS) {
    if (gun.PROPERTIES) {
      gun.PROPERTIES.ALT_FIRE = true;
      // Nerf front barrels
      if (gun.PROPERTIES.SHOOT_SETTINGS) {
        gun.PROPERTIES.SHOOT_SETTINGS = combineStats([
          gun.PROPERTIES.SHOOT_SETTINGS,
          g.flankGuard,
          g.triAngle,
          g.triAngleFront,
          { recoil: frontRecoilFactor },
        ]);
      }
    }
  }
  // Assign misc settings
  if (output.FACING_TYPE == "locksFacing") output.FACING_TYPE = "toTarget";
  output.GUNS =
    type.GUNS == null ? [...shootyBois] : [...output.GUNS, ...shootyBois];
  output.LABEL = name == -1 ? "Bird " + type.LABEL : name;
  return output;
};
const makeSplit = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type);
  let cannons = [
    {
      POSITION: [18, 8, 1, 0, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flankGuard]),
        TYPE: "bullet",
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flankGuard]),
        TYPE: "bullet",
      },
    },
  ];
  output.GUNS = type.GUNS == null ? cannons : type.GUNS.concat(cannons);
  output.LABEL = name == -1 ? "Split " + type.LABEL : name;
  return output;
};
const makeTriGuard = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type),
    cannons = [
      {
        POSITION: [13, 8, 1, 0, 0, 180, 0],
      },
      {
        POSITION: [4, 8, 1.7, 13, 0, 180, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap]),
          TYPE: "trap",
          STAT_CALCULATOR: "trap",
        },
      },
      {
        POSITION: [13, 8, 1, 0, 0, 90, 0],
      },
      {
        POSITION: [4, 8, 1.7, 13, 0, 90, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap]),
          TYPE: "trap",
          STAT_CALCULATOR: "trap",
        },
      },
      {
        POSITION: [13, 8, 1, 0, 0, 270, 0],
      },
      {
        POSITION: [4, 8, 1.7, 13, 0, 270, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap]),
          TYPE: "trap",
          STAT_CALCULATOR: "trap",
        },
      },
    ];
  output.GUNS = type.GUNS == null ? cannons : type.GUNS.concat(cannons);
  output.LABEL = name == -1 ? "Tri-" + type.LABEL + " Guard" : name;
  return output;
};
const makePenGuard = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type),
    cannons = [
      {
        POSITION: [20, 8, 1, 0, 0, 180, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.basic]),
          TYPE: "bullet",
        },
      },
      {
        POSITION: [4, 8, 1.7, 13, 0, 180, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap]),
          TYPE: "trap",
          STAT_CALCULATOR: "trap",
        },
      },
    ];
  output.GUNS = type.GUNS == null ? cannons : type.GUNS.concat(cannons);
  output.LABEL = name == -1 ? type.LABEL + " Guard" : name;
  return output;
};
const makeMechGuard = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type),
    cannons = [
      {
        POSITION: [15, 8, 1, 0, 0, 180, 0],
      },
      {
        POSITION: [3, 8, 1.7, 15, 0, 180, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap]),
          TYPE: "AR_autoTrap",
          STAT_CALCULATOR: "trap",
        },
      },
      {
        POSITION: [12, 11, 1, 0, 0, 180, 0],
      },
    ];
  output.GUNS = type.GUNS == null ? cannons : type.GUNS.concat(cannons);
  output.LABEL = name == -1 ? type.LABEL + " Guard" : name;
  return output;
};
const makeMachineGuard = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type),
    cannons = [
      {
        POSITION: [15, 9, 1.4, 0, 0, 180, 0],
      },
      {
        POSITION: [3, 13, 1.3, 15, 0, 180, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([
            g.trap,
            g.machineGun,
            { reload: 0.625, size: 0.625, spray: 0.75 },
          ]),
          TYPE: "trap",
          STAT_CALCULATOR: "trap",
        },
      },
    ];
  output.GUNS = type.GUNS == null ? cannons : type.GUNS.concat(cannons);
  output.LABEL = name == -1 ? type.LABEL + " Guard" : name;
  return output;
};

// Spawner Functions
const makeSwarming = (type, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type);
  let spawner = {
    POSITION: [7, 7.5, 0.6, 7, 0, 0, 0],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.swarm]),
      TYPE: "autoswarm",
      STAT_CALCULATOR: "swarm",
    },
  };
  if (type.TURRETS != null) {
    output.TURRETS = type.TURRETS;
  }
  if (type.GUNS == null) {
    output.GUNS = [spawner];
  } else {
    output.GUNS = [...type.GUNS, spawner];
  }
  if (name == -1) {
    output.LABEL = "Swarming " + type.LABEL;
  } else {
    output.LABEL = name;
  }
  return output;
};

// Auto-Functions
const makeMegaAuto = (type, name = -1, options = {}) => {
  type = ensureIsClass(type);
  let turret = {
    type: "megaAutoTankGun",
    size: 12,
    independent: true,
    color: 16,
    angle: 180,
  };
  if (options.type != null) {
    turret.type = options.type;
  }
  if (options.size != null) {
    turret.size = options.size;
  }
  if (options.independent != null) {
    turret.independent = options.independent;
  }
  if (options.color != null) {
    turret.color = options.color;
  }
  if (options.angle != null) {
    turret.angle = options.angle;
  }
  let output = dereference(type);
  let autogun = {
    POSITION: [turret.size, 0, 0, turret.angle, 360, 1],
    TYPE: [
      turret.type,
      {
        CONTROLLERS: ["nearestDifferentMaster"],
        INDEPENDENT: turret.independent,
        COLOR: turret.color,
      },
    ],
  };
  if (type.GUNS != null) {
    output.GUNS = type.GUNS;
  }
  if (type.TURRETS == null) {
    output.TURRETS = [autogun];
  } else {
    output.TURRETS = [...type.TURRETS, autogun];
  }
  if (name == -1) {
    output.LABEL = "Mega Auto-" + type.LABEL;
  } else {
    output.LABEL = name;
  }
  output.DANGER = type.DANGER + 2;
  return output;
};
const makeTripleAuto = (type, name = -1, options = {}) => {
  type = ensureIsClass(type);
  let turret = {
    type: "autoTurret",
    size: 6,
    independent: true,
    color: 16,
    angle: 180,
  };
  if (options.type != null) {
    turret.type = options.type;
  }
  if (options.independent != null) {
    turret.independent = options.independent;
  }
  if (options.color != null) {
    turret.color = options.color;
  }
  let output = dereference(type);
  let autogun = {
    POSITION: [turret.size, 4.5, 0, 0, 150, 1],
    TYPE: [
      turret.type,
      {
        CONTROLLERS: ["nearestDifferentMaster"],
        INDEPENDENT: turret.independent,
        COLOR: turret.color,
      },
    ],
  };
  let autogun1 = {
    POSITION: [turret.size, 4.5, 0, 120, 150, 1],
    TYPE: [
      turret.type,
      {
        CONTROLLERS: ["nearestDifferentMaster"],
        INDEPENDENT: turret.independent,
        COLOR: turret.color,
      },
    ],
  };
  let autogun2 = {
    POSITION: [turret.size, 4.5, 0, -120, 150, 1],
    TYPE: [
      turret.type,
      {
        CONTROLLERS: ["nearestDifferentMaster"],
        INDEPENDENT: turret.independent,
        COLOR: turret.color,
      },
    ],
  };
  if (type.GUNS != null) {
    output.GUNS = type.GUNS;
  }
  if (type.TURRETS == null) {
    output.TURRETS = [autogun, autogun1, autogun2];
  } else {
    output.TURRETS = [...type.TURRETS, autogun, autogun1, autogun2];
  }
  if (name == -1) {
    output.LABEL = "Triple Auto-" + type.LABEL;
  } else {
    output.LABEL = name;
  }
  output.DANGER = type.DANGER + 2;
  return output;
};

// Misc Functions
const makeFast = (type, mult = 1.1, name = -1) => {
  type = ensureIsClass(type);
  let output = dereference(type);
  if (output.BODY.SPEED) output.BODY.SPEED = base.SPEED;
  output.BODY.SPEED *= mult;
  output.LABEL = name == -1 ? output.LABEL : name;
  return output;
};

//Variables for re-used guns
const gunnerGuns = [
  {
    POSITION: [12, 3.5, 1, 0, 7.25, 0, 0.5],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.gunner, { speed: 1.2 }]),
      TYPE: "bullet",
    },
  },
  {
    POSITION: [12, 3.5, 1, 0, -7.25, 0, 0.75],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.gunner, { speed: 1.2 }]),
      TYPE: "bullet",
    },
  },
  {
    POSITION: [16, 3.5, 1, 0, 3.75, 0, 0],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.gunner, { speed: 1.2 }]),
      TYPE: "bullet",
    },
  },
  {
    POSITION: [16, 3.5, 1, 0, -3.75, 0, 0.25],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.gunner, { speed: 1.2 }]),
      TYPE: "bullet",
    },
  },
];

// Missiles
Class.AR_autoMiniMissile = makeAuto("minimissile");
Class.AR_clusterMissile = {
  PARENT: "minimissile",
  TURRETS: [
    {
      POSITION: [10, 0, 0, 0, 360, 1],
      TYPE: "genericEntity",
    },
  ],
  GUNS: [
    {
      POSITION: [14, 6, 1, 0, 0, 180, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skimmer,
          { reload: 0.5 },
          g.lowPower,
          { recoil: 1.35 },
          { speed: 1.3, maxSpeed: 1.3 },
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: "thruster",
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 30, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 60, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 120, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 150, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 210, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 240, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 300, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
    {
      POSITION: [8, 8, 1, 0, 0, 330, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pounder,
          g.artillery,
          g.artillery,
          g.noSpread,
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        SHOOT_ON_DEATH: true,
      },
    },
  ],
};
Class.AR_pitcherMissile = {
  PARENT: "minimissile",
  GUNS: [
    {
      POSITION: [14, 8, 1, 0, 5.5, 180, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skimmer,
          { reload: 0.5 },
          g.lowPower,
          { recoil: 1.15 },
          { speed: 1.3, maxSpeed: 1.3 },
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: "thruster",
      },
    },
    {
      POSITION: [14, 8, 1, 0, -5.5, 180, 0.5],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skimmer,
          { reload: 0.5 },
          g.lowPower,
          { recoil: 1.15 },
          { speed: 1.3, maxSpeed: 1.3 },
        ]),
        TYPE: ["bullet", { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: "thruster",
      },
    },
  ],
};
Class.AR_projectorMissile = makeMulti("minimissile", 2, "Missile");

// Drones
Class.AR_fastDrone = makeFast("drone");
Class.AR_fasterDrone = makeFast("drone", 1.2);
Class.AR_fastestDrone = makeFast("drone", 1.4);
Class.AR_fastSwarm = makeFast("swarm");
Class.AR_fastMinion = makeFast("minion");
Class.AR_turretedFastDrone = makeAuto("AR_fastDrone", "Auto-Drone", {
  type: "droneAutoTurret",
});
Class.AR_swarmingDrone = makeAuto("drone", "Swarm Auto-Swarm", {
  type: "AR_swarmDroneTurret",
});
Class.AR_superSwarmingDrone = makeAuto("drone", "Swarm Auto-Swarm", {
  type: "AR_superSwarmDroneTurret",
});
Class.AR_turretedSwarm = makeAuto("swarm", "Auto-Swarm", {
  type: "droneAutoTurret",
});
Class.AR_turretedSunchip = makeAuto("sunchip", "Auto-Sunchip", {
  type: "droneAutoTurret",
});
Class.AR_turretedMinion = makeAuto("minion", "Auto-Minion", {
  type: "droneAutoTurret",
});
Class.AR_pounderMinion = {
  PARENT: "minion",
  GUNS: [
    {
      POSITION: [19.5, 15, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pounder, g.minionGun]),
        WAIT_TO_CYCLE: true,
        TYPE: "bullet",
      },
    },
  ],
};

// T
