import React, { useState } from 'react';
import DirectoryList from './components/DirectoryList';
import DirectoryDetails from './components/DirectoryDetails';
import { Diretorio } from './types';

const App: React.FC = () => {
    const [diretorioSelecionado, setDiretorioSelecionado] = useState<Diretorio | null>(null);

    // Atualiza o diretório selecionado com novos arquivos
    const handleUpdateDiretorio = (diretorioAtualizado: Diretorio) => {
        setDiretorioSelecionado(diretorioAtualizado);
    };

    return (
        <div className="App">
            <header className="header" style={{ textAlign: 'center' }}>
                <h1>Sistema de Arquivos Virtual</h1>
            </header>
            <main>
                {diretorioSelecionado ? (
                    <DirectoryDetails
                        diretorio={diretorioSelecionado}
                        onUpdate={handleUpdateDiretorio}
                    />
                ) : (
                    <DirectoryList onSelectDirectory={setDiretorioSelecionado} />
                )}
            </main>
            <footer
                className="footer"
                style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: "60px",
                    textAlign: "center",
                    lineHeight: "60px",}}>
                &copy; 2024 Criado por Guilherme de Brida de Bona
            </footer>
        </div>
    );
};

export default App;

