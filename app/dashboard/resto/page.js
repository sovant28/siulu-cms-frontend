"use client";
import KnowledgeBaseCategoryList from '../components/KnowledgeBaseCategoryList';

export default function RestoranCafeRAG() {
  const filterFn = (item) => {
    return (
      item.kategori === 'kuliner' && 
      (item.informasi_biaya?.jenis === 'tempat_makan' || !item.id.startsWith('FOOD-'))
    );
  };

  return (
    <KnowledgeBaseCategoryList 
      title="Restoran & Cafe"
      description="Kelola data RAG warung makan, cafe, kedai kopi, dan restoran penyedia hidangan."
      defaultType="restoran"
      filterFn={filterFn}
    />
  );
}
