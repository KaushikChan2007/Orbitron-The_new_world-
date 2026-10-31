import React, { useState, useEffect } from 'react';
import { TopNav, NavView } from './components/TopNav';
import { MissionControl } from './pages/MissionControl';
import { Explorer } from './pages/Explorer';
import { Dossier } from './pages/Dossier';
import { AnatomyLab } from './pages/AnatomyLab';
import { Comparison } from './pages/Comparison';
import { Settlement } from './pages/Settlement';
import { SpectrumLab } from './pages/SpectrumLab';
import { About } from './pages/About';
import { DetailDrawer } from './components/DetailDrawer';
import { FloatingAiPanel } from './components/FloatingAiPanel';
import { Exoplanet } from './types';
import { calculateHabitability } from './lib/habitability';
import defaultSnapshot from './data/planets_snapshot.json';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('mission_control');
  const [history, setHistory] = useState<NavView[]>(['mission_control']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleSelectView = (view: NavView) => {
    if (view === currentView) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(view);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentView(view);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentView(history[prevIdx]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentView(history[nextIdx]);
    }
  };

  const initialPlanets = (defaultSnapshot.planets || []) as Exoplanet[];
  const [planets, setPlanets] = useState<Exoplanet[]>(initialPlanets);
  const [featuredPlanet, setFeaturedPlanet] = useState<Exoplanet>(() => {
    return initialPlanets.find((p) => p.pl_name === 'Kepler-186 f') ||
           initialPlanets.find((p) => p.pl_name === 'TRAPPIST-1 e') ||
           initialPlanets[0];
  });
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(() => {
    return initialPlanets.find((p) => p.pl_name === 'Kepler-186 f') ||
           initialPlanets.find((p) => p.pl_name === 'TRAPPIST-1 e') ||
           initialPlanets[0] || null;
  });
  const [drawerPlanet, setDrawerPlanet] = useState<Exoplanet | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [comparisonList, setComparisonList] = useState<Exoplanet[]>(() => {
    const comp = initialPlanets.filter((p) => p.pl_name === 'TRAPPIST-1 e' || p.pl_name === 'Kepler-186 f' || p.pl_name === 'Proxima Cen b');
    return comp.length > 0 ? comp : initialPlanets.slice(0, 2);
  });
  const [metadata, setMetadata] = useState<any>(defaultSnapshot.metadata || {});

  // Sync with backend if reachable
  useEffect(() => {
    fetch('/api/planets?limit=520')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        if (data.planets && data.planets.length > 0) {
          setPlanets(data.planets);
          if (data.metadata) setMetadata(data.metadata);
        }
      })
      .catch((err) => {
        console.log('Running on bundled high-fidelity NASA snapshot:', err.message);
      });

    // Also fetch enriched habitable candidate dataset from nasa_service
    fetch('/api/planets/habitable')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.candidates && data.candidates.length > 0) {
          const topCandidates = data.candidates.slice(0, 3);
          setComparisonList(topCandidates);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPlanet = (planet: Exoplanet) => {
    setSelectedPlanet(planet);
    setFeaturedPlanet(planet);
  };

  const handleOpenDetail = (planet: Exoplanet) => {
    setDrawerPlanet(planet);
    setIsDrawerOpen(true);
  };

  const handleAddToComparison = (planet: Exoplanet) => {
    setComparisonList((prev) => {
      if (prev.some((p) => p.pl_name === planet.pl_name)) return prev;
      if (prev.length >= 3) {
        return [...prev.slice(1), planet];
      }
      return [...prev, planet];
    });
    handleSelectView('compare');
  };

  const handleRemoveFromComparison = (planetName: string) => {
    setComparisonList((prev) => prev.filter((p) => p.pl_name !== planetName));
  };

  const habitability = selectedPlanet ? calculateHabitability(selectedPlanet) : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Floating Top Nav with Forward and Backward Navigation */}
      <TopNav
        currentView={currentView}
        onSelectView={handleSelectView}
        onOpenAi={() => setIsAiOpen(!isAiOpen)}
        onSearchClick={() => handleSelectView('explorer')}
        retrievedAt={metadata.retrieved_at}
        totalPlanets={planets.length}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full px-4 sm:px-8 pt-5">
        {currentView === 'mission_control' && (
          <MissionControl
            planets={planets}
            featuredPlanet={featuredPlanet}
            onNavigate={(view) => handleSelectView(view as NavView)}
            onSelectPlanet={handleSelectPlanet}
            retrievedAt={metadata.retrieved_at}
          />
        )}

        {currentView === 'explorer' && (
          <Explorer
            planets={planets}
            selectedPlanet={selectedPlanet}
            onSelectPlanet={handleSelectPlanet}
            onOpenDetail={handleOpenDetail}
            onNavigate={(view) => handleSelectView(view as NavView)}
            onAddToComparison={handleAddToComparison}
          />
        )}

        {currentView === 'dossier' && (
          <Dossier
            planet={selectedPlanet || featuredPlanet}
            allPlanets={planets}
            onSelectPlanet={handleSelectPlanet}
            onNavigate={(view) => handleSelectView(view as NavView)}
            onAddToCompare={handleAddToComparison}
          />
        )}

        {currentView === 'anatomy_lab' && (
          <AnatomyLab
            selectedPlanet={selectedPlanet}
            onNavigate={(view) => handleSelectView(view as NavView)}
          />
        )}

        {currentView === 'compare' && (
          <Comparison
            comparisonList={comparisonList}
            allPlanets={planets}
            onAddPlanet={handleAddToComparison}
            onRemovePlanet={handleRemoveFromComparison}
            onNavigate={(view) => handleSelectView(view as NavView)}
            onSelectPlanet={handleSelectPlanet}
          />
        )}

        {currentView === 'settlement' && (
          <Settlement onNavigate={(view) => handleSelectView(view as NavView)} />
        )}

        {currentView === 'spectrum' && (
          <SpectrumLab
            selectedPlanetName={selectedPlanet?.pl_name}
            onNavigate={(view) => handleSelectView(view as NavView)}
          />
        )}

        {currentView === 'about' && (
          <About retrievedAt={metadata.retrieved_at} />
        )}
      </main>

      {/* Floating AI Panel (toggleable from top nav button) */}
      <FloatingAiPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        selectedPlanet={selectedPlanet}
        habitability={habitability}
        onNavigate={(view) => setCurrentView(view as NavView)}
      />

      {/* Quick View Detail Drawer */}
      <DetailDrawer
        planet={drawerPlanet}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAnalyze={(p) => {
          handleSelectPlanet(p);
          setIsDrawerOpen(false);
          setCurrentView('dossier');
        }}
        onCompare={(p) => {
          handleAddToComparison(p);
          setIsDrawerOpen(false);
        }}
        onOpenSpectrum={(p) => {
          handleSelectPlanet(p);
          setIsDrawerOpen(false);
          setCurrentView('spectrum');
        }}
        retrievedAt={metadata.retrieved_at}
      />
    </div>
  );
}

export default App;
