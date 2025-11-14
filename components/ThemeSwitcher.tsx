'use client';

import { useEffect, useState } from 'react';

const themes = [
  { name: 'light', label: '浅色', icon: '☀️' },
  { name: 'dark', label: '暗色', icon: '🌙' },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('light');

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#f7f8fb';
    document.body.style.color = theme === 'dark' ? '#f5f5f5' : '#1f2933';
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white/70 px-1 py-1 shadow-sm">
      {themes.map((theme) => {
        const isActive = currentTheme === theme.name;
        return (
          <button
            key={theme.name}
            type="button"
            onClick={() => changeTheme(theme.name)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
              isActive
                ? 'bg-neutral-900 text-white shadow'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            aria-pressed={isActive}
          >
            <span>{theme.icon}</span>
            <span className="hidden sm:inline">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
