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

    // Fetch arquivos when the directory is selected
    useEffect(() => {
        const fetchArquivos = async () => {
            try {
                const response = await api.get<Arquivo[]>(`/arquivos?diretorioId=${diretorio.id}`);
                setArquivos(response.data);
            } catch (error) {
                console.error("Erro ao buscar arquivos:", error);
            }
        };

        if (modalVisible) {
            fetchArquivos();
        }
    }, [modalVisible, diretorio.id]);

    const addArquivo = async () => {
        try {
            const response = await api.post(`/arquivos`, {
                nome: nomeArquivo,
                diretorio: { id: diretorio.id }
            });
            const diretorioAtualizado = {
                ...diretorio,
                arquivos: [...arquivos, response.data]
            };
            onUpdate(diretorioAtualizado);
            setNomeArquivo('');
        } catch (error) {
            console.error("Erro ao adicionar arquivo:", error);
        }
    };

    const showArquivoModal = (arquivo: Arquivo) => {
        setSelectedArquivo(arquivo);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedArquivo(null);
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
            <Button type="primary" onClick={addArquivo}>
                Adicionar Arquivo
            </Button>

            <h4 style={{ marginTop: '20px' }}>Arquivos:</h4>
            <List
                bordered
                dataSource={arquivos} // Use the arquivos state here
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
