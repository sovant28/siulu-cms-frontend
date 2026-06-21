"use client";
import KnowledgeBaseCategoryList from '../components/KnowledgeBaseCategoryList';

export default function DestinasiWisataRAG() {
  const filterFn = (item) => {
    return (
      item.kategori === 'alam' || 
      item.kategori === 'budaya_religi' || 
      item.kategori === 'transportasi'
    );
  };

  return (
    <KnowledgeBaseCategoryList 
      title="Tempat Wisata"
      description="Kelola data RAG pariwisata alam, budaya, religi, dan transportasi Tana Toraja."
      defaultType="destinasi"
      filterFn={filterFn}
    />
  );
}
