import React, { useState, useEffect } from 'react';
import { Modal, List, Button } from 'antd';
import api from '../services/api';
import { Arquivo, Diretorio } from '../types';

interface FileListProps {
    diretorio: Diretorio;
}

const FileList: React.FC<FileListProps> = ({ diretorio }) => {
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const [selectedArquivo, setSelectedArquivo] = useState<Arquivo | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchArquivos();
    }, [diretorio]);

    const fetchArquivos = async () => {
        try {
            const response = await api.get<Arquivo[]>(`/diretorios/${diretorio.id}/arquivos`);
            setArquivos(response.data);
        } catch (error) {
            console.error("Erro ao buscar arquivos:", error);
        }
    };

    const showModal = (arquivo: Arquivo) => {
        setSelectedArquivo(arquivo);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedArquivo(null);
    };

    return (
        <div>
            <h3>Arquivos do Diretório: {diretorio.nome}</h3>

            <List
                bordered
                dataSource={arquivos}
                renderItem={arquivo => (
                    <List.Item
                        actions={[
                            <Button type="link" onClick={() => showModal(arquivo)}>
                                Ver Detalhes
                            </Button>,
                        ]}
                    >
                        {arquivo.nome}
                    </List.Item>
                )}
            />

            <Modal
                title={selectedArquivo?.nome}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                {selectedArquivo && (
                    <div>
                        <p>ID: {selectedArquivo.id}</p>
                        <p>Nome: {selectedArquivo.nome}</p>
                        <p>Diretório: {selectedArquivo.diretorio.nome}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FileList;
