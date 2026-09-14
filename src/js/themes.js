export const themes = {
    default: {
        name: "Midnight",
        bg: "#050509",
        surface: "rgba(10,12,24,0.96)",
        accent: "#a855f7",
        accentSoft: "rgba(168,85,247,0.14)",
        danger: "#ff5c7a",
        muted: "#9c9cb5"
    },
    terminal: {
        name: "Terminal",
        bg: "#020302",
        surface: "rgba(4,9,8,0.96)",
        accent: "#22c55e",
        accentSoft: "rgba(34,197,94,0.18)",
        danger: "#f97316",
        muted: "#86efac"
    },
    newspaper: {
        name: "Paper",
        bg: "#f4f1ea",
        surface: "rgba(252,251,247,0.98)",
        accent: "#0f4aad",
        accentSoft: "rgba(15,74,173,0.12)",
        danger: "#d7263d",
        muted: "#4b4b56"
    },
    blueprint: {
        name: "Blueprint",
        bg: "#02091a",
        surface: "rgba(5,20,55,0.98)",
        accent: "#60a5fa",
        accentSoft: "rgba(96,165,250,0.18)",
        danger: "#eab308",
        muted: "#bfdbfe"
    },
    forest: {
        name: "Forest",
        bg: "#010807",
        surface: "rgba(6,24,18,0.98)",
        accent: "#22c55e",
        accentSoft: "rgba(34,197,94,0.18)",
        danger: "#fb7185",
        muted: "#a7f3d0"
    }
};

export function applyTheme(key) {
    const t = themes[key] || themes.default;
    document.documentElement.style.setProperty("--bg", t.bg);
    document.documentElement.style.setProperty("--surface", t.surface);
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent-soft", t.accentSoft);
    document.documentElement.style.setProperty("--danger", t.danger);
    document.documentElement.style.setProperty("--muted", t.muted);
}
