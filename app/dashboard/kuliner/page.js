"use client";
import KnowledgeBaseCategoryList from '../components/KnowledgeBaseCategoryList';

export default function KulinerKhasRAG() {
  const filterFn = (item) => {
    return (
      item.kategori === 'kuliner' && 
      (item.informasi_biaya?.jenis === 'makanan_khas' || item.id.startsWith('FOOD-'))
    );
  };

  return (
    <KnowledgeBaseCategoryList 
      title="Kuliner Tradisional"
      description="Kelola data RAG makanan khas tradisi, kue basah, olahan kopi Toraja, dan masakan adat."
      defaultType="kuliner"
      filterFn={filterFn}
    />
  );
}
