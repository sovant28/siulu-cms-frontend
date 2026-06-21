"use client";
import KnowledgeBaseCategoryList from '../components/KnowledgeBaseCategoryList';

export default function InformasiDaruratRAG() {
  const filterFn = (item) => {
    return item.kategori === 'darurat' || item.kategori === 'informasi_umum';
  };

  return (
    <KnowledgeBaseCategoryList 
      title="Informasi & Darurat"
      description="Kelola data RAG kontak penting rumah sakit, kepolisian, kantor pemadam, dan tips umum wisatawan."
      defaultType="darurat"
      filterFn={filterFn}
    />
  );
}
