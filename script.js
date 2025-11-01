const totalChuzzEl = document.getElementById("totalChuzz");
const chuzzPerClickEl = document.getElementById("chuzzPerClick");
const comboEl = document.getElementById("combo");
const chuzzOneBtn = document.getElementById("chuzzOne");
const chuzzTwoBtn = document.getElementById("chuzzTwo");
const achievementFeed = document.getElementById("achievementFeed");
const powerupContainer = document.getElementById("powerupContainer");
const upgradeList = document.getElementById("upgradeList");
const eventFeed = document.getElementById("eventFeed");
const loreText = document.getElementById("loreText");
const factText = document.getElementById("factText");
const logo = document.querySelector(".logo");
const mysteryPanel = document.getElementById("mysteryPanel");

let chuzz = 0;
let lifetimeChuzz = 0;
let basePerClick = 1;
let bonusMultiplier = 1;
let comboMultiplier = 0;
let comboInterval;
let logoTapCount = 0;
let hiddenMessageRevealed = false;
const comboDecayMs = 1200;

const loreFragments = [
  "Legend speaks of a Chuzz so large it eclipsed the moon.",
  "SMALL D CHUZZ once defeated a cosmic goose using only sarcasm.",
  "FAT CHUZZ invented the concept of brunch in 1983, allegedly.",
  "When both Chuzz laugh in sync, parallel universes align for a moment.",
  "Every 1,000 Chuzz collected echoes as a bass drop in the void.",
  "Rumor: there is a third Chuzz hiding in the UI, watching.",
  "Chuzz energy tastes like bubblegum and existential dread."
];

const factoids = [
  "FAT CHUZZ can bench press a planet but prefers hugging it instead.",
  "SMALL D CHUZZ has 12 honorary PhDs in Chaos Theory.",
  "Chuzz HQ is an inflatable castle tethered above the city.",
  "The Chuzz twins stream retro games every Wednesday at 3AM.",
  "ULTIMATE CHUZZ is just both Chuzz wearing the same hoodie.",
  "Every click is legally considered a high-five in Chuzz law.",
  "FAT CHUZZ photobombs satellite imagery for fun.",
  "SMALL D CHUZZ invented glitter thunderstorms."
];

const upgrades = [
  {
    id: "double-clicks",
    name: "Double Vision",
    description: "Clicks now yield +1 extra Chuzz energy.",
    cost: 45,
    apply: () => {
      basePerClick += 1;
      logEvent("Upgrade", "Double Vision installed: +1 per click");
    },
  },
  {
    id: "combo-boost",
    name: "Combo Crescendo",
    description: "Combo stacks decay slower. Easier to go turbo!",
    cost: 120,
    apply: () => {
      comboMultiplier += 1;
      logEvent("Upgrade", "Combo decay slowed and impact boosted");
    },
  },
  {
    id: "auto-chuzz",
    name: "Ghost Clickers",
    description: "Summons spectral fans who auto-click 3 Chuzz/sec.",
    cost: 250,
    apply: () => {
      logEvent("Upgrade", "Ghost clickers chanting your name");
      setInterval(() => addChuzz(3, { source: "Ghost Clickers" }), 1000);
    },
  },
  {
    id: "lore-boost",
    name: "Lore Librarian",
    description: "Lore reveals twice as fast and with sparkle effects.",
    cost: 400,
    apply: () => {
      loreInterval = Math.max(3000, loreInterval - 2000);
      resetLoreTimer();
      logEvent("Upgrade", "Lore Librarian unlocked hidden archives");
      triggerConfetti({ spread: 120, particleCount: 120 });
    },
  },
];

const secretCode = ["u", "l", "t", "i", "m", "a", "t", "e"];
let codeProgress = [];
let loreInterval = 8000;
let loreTimer = setInterval(() => cycleLore(), loreInterval);

const achievements = new Map();
const milestoneLore = new Map([
  [100, "A whisper: the Chuzz gate is ajar."],
  [250, "You hear jazz echoing from a neon canyon."],
  [500, "Somewhere, the third Chuzz taps their watch."],
  [777, "Lucky sequence! Chuzz luck x2 for 30 seconds."],
  [1000, "ULTIMATE CHUZZ nods approvingly in the shadows."],
]);

function addChuzz(amount, { source = "Click" } = {}) {
  chuzz += amount;
  lifetimeChuzz += amount;
  updateChuzzDisplay();
  maybeGrantMilestones();
  if (source === "Click") {
    rollFact();
  }
}

function updateChuzzDisplay() {
  totalChuzzEl.textContent = Math.floor(chuzz).toLocaleString();
  const perClick = basePerClick * (1 + comboMultiplier * 0.2) * bonusMultiplier;
  chuzzPerClickEl.textContent = perClick.toFixed(2);
  comboEl.textContent = `${bonusMultiplier.toFixed(1)}x`;
}

function handleClick(face) {
  const perClick = basePerClick * (1 + comboMultiplier * 0.2) * bonusMultiplier;
  const flavor = face === "one" ? "SMALL D" : "FAT";
  addChuzz(perClick, { source: "Click" });
  animateClick(face);
  logEvent("Click", `${flavor} CHUZZ approved ${perClick.toFixed(2)} energy.`);
  buildCombo();
}

function animateClick(face) {
  const button = face === "one" ? chuzzOneBtn : chuzzTwoBtn;
  button.classList.add("clicked");
  button.animate(
    [
      { transform: "scale(0.96) rotate(-1deg)" },
      { transform: "scale(1.02) rotate(1deg)" },
      { transform: "scale(1) rotate(0deg)" },
    ],
    { duration: 180, easing: "ease-out" }
  );
  setTimeout(() => button.classList.remove("clicked"), 220);
}

function buildCombo() {
  bonusMultiplier = Math.min(bonusMultiplier + 0.05, 4.5);
  updateChuzzDisplay();
  if (comboInterval) clearInterval(comboInterval);
  comboInterval = setInterval(() => {
    bonusMultiplier = Math.max(1, bonusMultiplier - 0.05);
    updateChuzzDisplay();
    if (bonusMultiplier <= 1.05) {
      clearInterval(comboInterval);
      comboInterval = null;
      bonusMultiplier = 1;
      updateChuzzDisplay();
    }
  }, comboDecayMs);
}

function logEvent(type, message) {
  const template = document.getElementById("eventTemplate");
  const item = template.content.cloneNode(true);
  item.querySelector(".event-time").textContent = new Date().toLocaleTimeString();
  item.querySelector(".event-message").textContent = `${type}: ${message}`;
  eventFeed.prepend(item);
  while (eventFeed.children.length > 6) {
    eventFeed.removeChild(eventFeed.lastChild);
  }
}

function showAchievement(text) {
  const el = document.createElement("div");
  el.className = "achievement";
  el.textContent = text;
  achievementFeed.prepend(el);
  triggerConfetti();
  setTimeout(() => {
    el.classList.add("fade");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  }, 3000);
}

function triggerConfetti(options = {}) {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      scalar: 0.9,
      ...options,
    });
  }
}

function maybeGrantMilestones() {
  milestoneLore.forEach((message, amount) => {
    if (lifetimeChuzz >= amount && !achievements.has(amount)) {
      achievements.set(amount, true);
      showAchievement(`Milestone ${amount}! ${message}`);
      loreText.textContent = message;
      if (amount === 777) {
        applyTimedBoost(2, 30000, "Lucky 777 boost!");
      }
    }
  });
}

function applyTimedBoost(multiplier, duration, label) {
  bonusMultiplier *= multiplier;
  updateChuzzDisplay();
  logEvent("Boost", `${label} (${multiplier.toFixed(2)}x for ${duration / 1000}s)`);
  const endTime = Date.now() + duration;
  const timer = setInterval(() => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      clearInterval(timer);
      bonusMultiplier = Math.max(1, bonusMultiplier / multiplier);
      updateChuzzDisplay();
      logEvent("Boost", `${label} fizzled out.`);
    }
  }, 1000);
}

function cycleLore() {
  const nextLore = loreFragments[Math.floor(Math.random() * loreFragments.length)];
  loreText.textContent = nextLore;
}

function resetLoreTimer() {
  clearInterval(loreTimer);
  loreTimer = setInterval(() => cycleLore(), loreInterval);
}

function rollFact() {
  const fact = factoids[Math.floor(Math.random() * factoids.length)];
  factText.textContent = fact;
}

function spawnPowerup() {
  const powerupTypes = [
    {
      name: "ULTIMATE CHUZZ",
      color: "var(--accent-alt)",
      apply: () => {
        applyTimedBoost(2.5, 15000, "ULTIMATE CHUZZ RAMPAGE!");
        showAchievement("ULTIMATE CHUZZ descended from the neon skies!");
      },
    },
    {
      name: "FAT CHUZZ", // fat chuzz powerup
      color: "var(--warning)",
      apply: () => {
        const interval = setInterval(() => addChuzz(8, { source: "Powerup" }), 800);
        setTimeout(() => clearInterval(interval), 12000);
        logEvent("Powerup", "FAT CHUZZ is spoon-feeding energy!");
      },
    },
  ];

  const powerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
  const el = document.createElement("button");
  el.className = "powerup";
  el.style.left = `${Math.random() * 60 + 20}%`;
  el.style.top = `${Math.random() * 50 + 10}%`;
  el.style.background = `linear-gradient(135deg, ${powerup.color}, var(--accent))`;
  el.textContent = powerup.name;
  el.addEventListener("click", () => {
    powerup.apply();
    logEvent("Powerup", `${powerup.name} activated!`);
    el.remove();
  });

  powerupContainer.appendChild(el);
  setTimeout(() => el.remove(), 7500);
}

function renderUpgrades() {
  const template = document.getElementById("upgradeTemplate");
  upgrades.forEach((upgrade) => {
    const node = template.content.cloneNode(true);
    const li = node.querySelector(".upgrade");
    li.dataset.id = upgrade.id;
    node.querySelector(".upgrade-name").textContent = upgrade.name;
    node.querySelector(".upgrade-description").textContent = `${upgrade.description} (Cost: ${upgrade.cost})`;
    const button = node.querySelector(".upgrade-buy");
    button.addEventListener("click", () => buyUpgrade(upgrade, button));
    upgradeList.appendChild(node);
  });
}

function buyUpgrade(upgrade, button) {
  if (upgrade.purchased) return;
  if (chuzz < upgrade.cost) {
    logEvent("Upgrade", "Need more Chuzz energy!");
    button.classList.add("shake");
    setTimeout(() => button.classList.remove("shake"), 300);
    return;
  }
  chuzz -= upgrade.cost;
  upgrade.purchased = true;
  button.disabled = true;
  button.textContent = "Equipped";
  upgrade.apply();
  updateChuzzDisplay();
}

function startPowerupStorm() {
  setInterval(() => {
    if (Math.random() < 0.6) {
      spawnPowerup();
    }
  }, 15000);
}

function handleCodeInput(event) {
  const key = event.key.toLowerCase();
  codeProgress.push(key);
  codeProgress = codeProgress.slice(-secretCode.length);
  if (secretCode.every((letter, idx) => codeProgress[idx] === letter)) {
    applyTimedBoost(3, 20000, "Secret code engaged!");
    showAchievement("You whispered 'ultimate' to the void.");
    codeProgress = [];
  }
}

function handleLogoTap() {
  logoTapCount += 1;
  if (logoTapCount === 7) {
    applyTimedBoost(1.5, 25000, "Logo tapped 7 times!");
    logEvent("Secret", "Logo chant unlocked hidden bass drop.");
    triggerConfetti({ particleCount: 150, spread: 120, startVelocity: 45 });
  }
}

function setMysteryPanel() {
  mysteryPanel.addEventListener("dblclick", () => {
    if (hiddenMessageRevealed) return;
    hiddenMessageRevealed = true;
    mysteryPanel.innerHTML = `
      <h2>Chuzz Rift</h2>
      <p>You have unlocked the hallway of endless snacks. +100 Chuzz.</p>
    `;
    addChuzz(100, { source: "Secret" });
    triggerConfetti({ particleCount: 200, spread: 140, scalar: 1.2 });
  });
}

function initEasterEggs() {
  document.body.addEventListener("click", (event) => {
    if (event.target.matches(".achievement")) {
      showAchievement("Stop poking the trophies! +5 Chuzz");
      addChuzz(5, { source: "Secret" });
    }
  });

  document.addEventListener("keydown", handleCodeInput);
  logo.addEventListener("click", handleLogoTap);
  setMysteryPanel();
}

function init() {
  renderUpgrades();
  updateChuzzDisplay();
  chuzzOneBtn.addEventListener("click", () => handleClick("one"));
  chuzzTwoBtn.addEventListener("click", () => handleClick("two"));
  startPowerupStorm();
  initEasterEggs();
}

init();
