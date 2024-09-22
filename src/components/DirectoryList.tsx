import React, { useEffect, useState } from 'react';
import { Input, Button, List, Modal, Select } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import { Diretorio } from '../types';
import DirectoryDetails from './DirectoryDetails'; // Import the DirectoryDetails component

const { confirm } = Modal;
const { Option } = Select;

const DirectoryList: React.FC<{ onSelectDirectory: (diretorio: Diretorio) => void }> = ({ onSelectDirectory }) => {
    const [diretorios, setDiretorios] = useState<Diretorio[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [nomeDiretorio, setNomeDiretorio] = useState<string>('');
    const [parentDiretorio, setParentDiretorio] = useState<Diretorio | null>(null);
    const [editingDiretorio, setEditingDiretorio] = useState<Diretorio | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDiretorio, setSelectedDiretorio] = useState<Diretorio | null>(null);

    useEffect(() => {
        fetchDiretorios();
    }, []);

    const fetchDiretorios = async () => {
        try {
            const response = await api.get<Diretorio[]>('/diretorios');
            setDiretorios(response.data);
        } catch (error) {
            console.error("Erro ao buscar diretórios:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveDiretorio = async () => {
        try {
            const data = {
                nome: nomeDiretorio,
                diretorioPai: parentDiretorio ? { id: parentDiretorio.id } : null,
            };
            const response = editingDiretorio
                ? await api.put<Diretorio>(`/diretorios/${editingDiretorio.id}`, data)
                : await api.post<Diretorio>('/diretorios', data);

            const updatedDiretorios = editingDiretorio
                ? diretorios.map(d => (d.id === editingDiretorio.id ? response.data : d))
                : [...diretorios, response.data];

            setDiretorios(updatedDiretorios);
            setModalVisible(false);
            setNomeDiretorio('');
            setParentDiretorio(null);
            setEditingDiretorio(null);
        } catch (error) {
            console.error("Erro ao salvar diretório:", error);
            // console.error(error.response?.data); // Log the error response from the server
        }
    };


    const showModal = (diretorio?: Diretorio) => {
        if (diretorio) {
            setNomeDiretorio(diretorio.nome);
            setEditingDiretorio(diretorio);
            setParentDiretorio(diretorio.diretorio_id ? diretorios.find(d => d.id === diretorio.diretorio_id) || null : null);
        } else {
            setNomeDiretorio('');
            setEditingDiretorio(null);
            setParentDiretorio(null);
        }
        setModalVisible(true);
    };

    const deleteDiretorio = async (id: number) => {
        try {
            await api.delete(`/diretorios/${id}`);
            setDiretorios(diretorios.filter(d => d.id !== id));
        } catch (error) {
            console.error("Erro ao excluir diretório:", error);
        }
    };

    const showDeleteConfirm = (diretorio: Diretorio) => {
        confirm({
            title: `Você tem certeza que deseja excluir o diretório "${diretorio.nome}"?`,
            icon: <ExclamationCircleOutlined />,
            content: 'Esta ação não poderá ser desfeita.',
            onOk() {
                deleteDiretorio(diretorio.id);
            },
            onCancel() {
                console.log('Cancelado');
            },
        });
    };
    const handleDirectorySelect = (diretorio: Diretorio) => {
        setSelectedDiretorio(diretorio);
        setModalVisible(false); // Close the modal for editing
    };

    const handleUpdateDiretorio = (diretorioAtualizado: Diretorio) => {
        setDiretorios(prev => prev.map(d => (d.id === diretorioAtualizado.id ? diretorioAtualizado : d)));
    };

    if (loading) {
        return <p>Carregando diretórios...</p>;
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Gerenciar Diretórios</h2>
            <Button type="primary" onClick={() => showModal()}>
                Adicionar Diretório
            </Button>

            <List
                style={{ marginTop: 20 }}
                bordered
                dataSource={diretorios}
                renderItem={diretorio => (
                    <List.Item
                        actions={[
                            <Button type="link" onClick={() => showModal(diretorio)}>
                                Editar
                            </Button>,
                            <Button type="link" danger onClick={() => showDeleteConfirm(diretorio)}>
                                Excluir
                            </Button>,
                        ]}
                    >
                        <Button type="link" onClick={() => handleDirectorySelect(diretorio)}>
                            {diretorio.nome}
                        </Button>
                    </List.Item>
                )}
            />

            <Modal
                title={editingDiretorio ? 'Editar Diretório' : 'Adicionar Diretório'}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalVisible(false)}>
                        Cancelar
                    </Button>,
                    <Button key="save" type="primary" onClick={saveDiretorio}>
                        Salvar
                    </Button>,
                ]}
            >
                <Input
                    value={nomeDiretorio}
                    onChange={(e) => setNomeDiretorio(e.target.value)}
                    placeholder="Nome do Diretório"
                />
                <Select
                    placeholder="Selecionar Diretório Pai"
                    style={{ width: '100%', marginTop: 10 }}
                    value={parentDiretorio ? parentDiretorio.id : undefined}
                    onChange={value => setParentDiretorio(diretorios.find(d => d.id === value) || null)}
                >
                    {diretorios.map(d => (
                        <Option key={d.id} value={d.id}>
                            {d.nome}
                        </Option>
                    ))}
                </Select>
            </Modal>

            <Modal
                title="Detalhes do Diretório"
                visible={!!selectedDiretorio}
                onCancel={() => setSelectedDiretorio(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedDiretorio(null)}>
                        Fechar
                    </Button>,
                ]}
            >
                {selectedDiretorio && (
                    <DirectoryDetails
                        diretorio={selectedDiretorio}
                        onUpdate={handleUpdateDiretorio}
                    />
                )}
            </Modal>
        </div>
    );
};

export default DirectoryList;
