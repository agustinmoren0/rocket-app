'use client'

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Home, Activity, FileText, TrendingUp, Settings,
  Calendar, BookOpen, PauseCircle, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  hotkey: string;
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { username } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [favoritePages, setFavoritePages] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const allMenuItems: MenuItem[] = [
    { icon: Home, label: 'Inicio', path: '/', hotkey: '1' },
    { icon: Activity, label: 'Actividades', path: '/actividades', hotkey: '2' },
    { icon: FileText, label: 'Mis Hábitos', path: '/habitos', hotkey: '3' },
    { icon: Calendar, label: 'Calendario', path: '/calendario', hotkey: '4' },
    { icon: TrendingUp, label: 'Progreso', path: '/progreso', hotkey: '5' },
    { icon: BookOpen, label: 'Reflexiones', path: '/reflexiones', hotkey: '6' },
    { icon: PauseCircle, label: 'Pausados', path: '/pausados', hotkey: '7' },
  ];

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('habika_favorite_pages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavoritePages(parsed);
      } catch {
        setFavoritePages(allMenuItems.slice(0, 3)); // Default to first 3
      }
    } else {
      setFavoritePages(allMenuItems.slice(0, 3)); // Default favorites
    }
    setLoading(false);
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ⌘/Ctrl + K para buscar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('sidebar-search');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      }

      // ⌘/Ctrl + número para navegar
      if (e.metaKey || e.ctrlKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 7) {
          e.preventDefault();
          router.push(allMenuItems[num - 1].path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Search in habits, activities, reflections
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]');
    const reflections = JSON.parse(localStorage.getItem('habika_reflections') || '[]');

    const results = [
      ...habits
        .filter((h: any) => h.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .map((h: any) => ({ id: h.id, name: h.name, type: 'habit', emoji: '📝' })),
      ...activities
        .filter((a: any) => a.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .map((a: any) => ({ id: a.id, name: a.name, type: 'activity', emoji: '🎯' })),
      ...reflections
        .filter((r: any) => r.achievements.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 1)
        .map((r: any) => ({
          id: r.id,
          name: `Reflexión - ${new Date(r.date).toLocaleDateString('es-ES')}`,
          type: 'reflection',
          emoji: '💭',
        })),
    ];

    setSearchResults(results.slice(0, 5));
  };

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(favoritePages);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setFavoritePages(items);
    localStorage.setItem('habika_favorite_pages', JSON.stringify(items));
  };

  if (loading) return null;

  return (
    <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 ${currentTheme.bgCard} border-r ${currentTheme.border} z-40`}>
      {/* Header con avatar */}
      <div className={`p-6 border-b ${currentTheme.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${currentTheme.gradient} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`font-bold text-lg ${currentTheme.text} truncate`}>{username}</h2>
            <p className={`text-sm ${currentTheme.textSecondary}`}>HABIKA</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`p-4 border-b ${currentTheme.border}`}>
        <div className="relative">
          <input
            id="sidebar-search"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar... (⌘K)"
            className={`w-full px-4 py-2 pl-10 rounded-xl border ${currentTheme.border} focus:border-rose-500 outline-none text-sm ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`}
          />
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary}`} />

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute left-0 right-0 top-full mt-2 ${currentTheme.bgCard} rounded-xl shadow-lg border ${currentTheme.border} p-2 z-50`}
              >
                {searchResults.map((result, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      if (result.type === 'habit') {
                        router.push(`/habito/${result.id}`);
                      } else if (result.type === 'activity') {
                        router.push(`/actividades`);
                      } else {
                        router.push(`/reflexiones`);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:${currentTheme.bgHover} transition-colors text-sm flex items-center gap-2`}
                  >
                    <span>{result.emoji}</span>
                    <span className={`truncate ${currentTheme.text}`}>{result.name}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Favoritos con Drag & Drop */}
      <div className={`px-4 py-3 border-b ${currentTheme.border}`}>
        <p className={`text-xs font-semibold ${currentTheme.textSecondary} mb-2 uppercase`}>Favoritos</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="favorites">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-1 ${snapshot.isDraggingOver ? `${currentTheme.bgCardSecondary} rounded-lg p-2` : ''}`}
              >
                {favoritePages.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <Draggable key={item.path} draggableId={item.path} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'opacity-50' : ''}
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                              isActive
                                ? `${currentTheme.gradient} text-white shadow-md`
                                : `${currentTheme.buttonHover} ${currentTheme.text} hover:opacity-80`
                            }`}
                          >
                            <Icon size={16} />
                            <span className="flex-1 text-left">{item.label}</span>
                          </motion.button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Menu principal */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className={`text-xs font-semibold ${currentTheme.textSecondary} mb-2 uppercase`}>Todas las páginas</p>
        {allMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? `${currentTheme.gradient} text-white shadow-lg`
                  : `${currentTheme.buttonHover} ${currentTheme.text}`
              }`}
            >
              <Icon size={20} />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                }`}
              >
                ⌘{item.hotkey}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t ${currentTheme.border}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/perfil')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${currentTheme.buttonHover} ${currentTheme.text} transition-all hover:shadow-md`}
        >
          <Settings size={20} />
          <span className="font-medium">Configuración</span>
        </motion.button>
      </div>
    </aside>
  );
}
