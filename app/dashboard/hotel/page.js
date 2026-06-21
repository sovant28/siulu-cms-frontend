"use client";
import KnowledgeBaseCategoryList from '../components/KnowledgeBaseCategoryList';

export default function HotelAkomodasiRAG() {
  const filterFn = (item) => {
    return item.kategori === 'akomodasi';
  };

  return (
    <KnowledgeBaseCategoryList 
      title="Hotel & Akomodasi"
      description="Kelola data RAG hotel, homestay, vila, dan penginapan di Tana Toraja."
      defaultType="hotel"
      filterFn={filterFn}
    />
  );
}
