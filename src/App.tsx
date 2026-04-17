import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import GameSelectPage from "./pages/GameSelectPage";
import MemoryMatchPage from "./pages/MemoryMatchPage";
import SortRushPage from "./pages/SortRushPage";
import PokedexPage from "./pages/PokedexPage";
import PokedexDetailPage from "./pages/PokedexDetailPage";
import HighScorePage from "./pages/HighScorePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/game' element={<GameSelectPage />} />
          <Route path='/game/memory' element={<MemoryMatchPage />} />
          <Route path='/game/sortrush' element={<SortRushPage />} />
          <Route path='/pokedex' element={<PokedexPage />} />
          <Route path='/pokedex/:id' element={<PokedexDetailPage />} />
          <Route path='/highscore' element={<HighScorePage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
