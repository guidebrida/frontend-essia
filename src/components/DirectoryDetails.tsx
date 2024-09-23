import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, List } from 'antd';
import api from '../services/api';
import { Diretorio, Arquivo } from '../types';

interface DirectoryDetailsProps {
    diretorio: Diretorio;
    onUpdate: (diretorioAtualizado: Diretorio) => void;
}

const DirectoryDetails: React.FC<DirectoryDetailsProps> = ({ diretorio, onUpdate }) => {
    const [nomeArquivo, setNomeArquivo] = useState<string>('');
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const [selectedArquivo, setSelectedArquivo] = useState<Arquivo | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        const fetchArquivos = async () => {
            try {
                const response = await api.get<Arquivo[]>(`/arquivos?diretorioId=${diretorio.id}`);
                setArquivos(response.data);
            } catch (error) {
                console.error("Erro ao buscar arquivos:", error);
            }
        };

        if (diretorio.id) {
            fetchArquivos();
        }
    }, [diretorio.id]);

    const saveArquivo = async () => {
        try {
            const data = {
                nome: nomeArquivo,
                diretorio: { id: diretorio.id }
            };
            const response = selectedArquivo
                ? await api.put<Arquivo>(`/arquivos/${selectedArquivo.id}`, data)
                : await api.post<Arquivo>('/arquivos', data);

            const diretorioAtualizado = {
                ...diretorio,
                arquivos: selectedArquivo
                    ? arquivos.map((arquivo) =>
                        arquivo.id === selectedArquivo.id ? response.data : arquivo
                    )
                    : [...arquivos, response.data]
            };

            onUpdate(diretorioAtualizado);
            setNomeArquivo('');
            setSelectedArquivo(null);
        } catch (error) {
            console.error("Erro ao salvar arquivo:", error);
        }
    };

    const showArquivoModal = (arquivo: Arquivo) => {
        setSelectedArquivo(arquivo);
        setNomeArquivo(arquivo.nome);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedArquivo(null);
        setNomeArquivo('');
    };

    return (
        <div>
            <h3>Diretório: {diretorio.nome}</h3>

            <Input
                value={nomeArquivo}
                onChange={(e) => setNomeArquivo(e.target.value)}
                placeholder="Nome do Arquivo"
                style={{ width: '300px', marginRight: '10px' }}
            />
            <Button type="primary" onClick={saveArquivo}>
                {selectedArquivo ? 'Editar Arquivo' : 'Adicionar Arquivo'}
            </Button>

            <h4 style={{ marginTop: '20px' }}>Arquivos:</h4>
            <List
                bordered
                dataSource={arquivos}
                renderItem={arquivo => (
                    <List.Item>
                        <Button type="link" onClick={() => showArquivoModal(arquivo)}>
                            {arquivo.nome}
                        </Button>
                    </List.Item>
                )}
            />

            <Modal
                title="Informações do Arquivo"
                visible={!!selectedArquivo}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Fechar
                    </Button>
                ]}
            >
                {selectedArquivo && (
                    <div>
                        <p><strong>ID do Arquivo:</strong> {selectedArquivo.id}</p>
                        <p><strong>Nome do Arquivo:</strong> {selectedArquivo.nome}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DirectoryDetails;
