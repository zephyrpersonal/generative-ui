'use client';

import { useEffect, useState } from 'react';

const themes = [
  { name: 'light', label: '亮色', icon: '☀️' },
  { name: 'dark', label: '暗色', icon: '🌙' },
  { name: 'cupcake', label: '蛋糕', icon: '🧁' },
  { name: 'cyberpunk', label: '赛博', icon: '🤖' },
  { name: 'valentine', label: '情人', icon: '💝' },
  { name: 'aqua', label: '水蓝', icon: '💧' },
  { name: 'dracula', label: '德古拉', icon: '🧛' },
  { name: 'night', label: '夜晚', icon: '🌃' },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  if (!mounted) {
    return (
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </label>
      </div>
    );
  }

  const currentThemeObj = themes.find(t => t.name === currentTheme) || themes[0];

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost gap-2">
        <span className="text-xl">{currentThemeObj.icon}</span>
        <span className="hidden sm:inline">{currentThemeObj.label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 mt-4 max-h-96 overflow-y-auto">
        <li className="menu-title">
          <span>选择主题</span>
        </li>
        {themes.map((theme) => (
          <li key={theme.name}>
            <a
              className={currentTheme === theme.name ? 'active' : ''}
              onClick={() => changeTheme(theme.name)}
            >
              <span className="text-xl">{theme.icon}</span>
              <span>{theme.label}</span>
              {currentTheme === theme.name && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
