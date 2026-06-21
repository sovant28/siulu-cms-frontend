"use client";
import KnowledgeBaseCategoryList from '../components/KnowledgeBaseCategoryList';

export default function EventRitualRAG() {
  const filterFn = (item) => {
    return item.kategori === 'event';
  };

  return (
    <KnowledgeBaseCategoryList 
      title="Event & Ritual Adat"
      description="Kelola data RAG upacara adat Rambu Solo', Rambu Tuka', festival pariwisata, dan kalender kegiatan."
      defaultType="event"
      filterFn={filterFn}
    />
  );
}
