// Final, guaranteed push
import React, { useState, useMemo } from 'react';
import HotLeadCard from '../../components/HotLeadCard';
import { Contact, CalendarEvent, formatPhoneNumber, followUpSchedule } from '../types';
import Calendar from '../components/Calendar';
import QuickActions from '../components/QuickActions';
import SetAppointmentModal from '../components/SetAppointmentModal';
import ConvertToClientModal from '../components/ConvertToClientModal';
import DatePicker from '../components/DatePicker';

interface HotLeadsPageProps {
  hotLeads: Contact[];
  onAddHotLead: (leadData: Omit<Contact, 'id'>) => Promise<Contact | null>;
  onUpdateHotLead: (lead: Contact) => void;
  onDeleteHotLead: (leadId: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  handleSetAppointment: (appointment: { client: string, lead: string, time: string, details?: string }, date: Date) => void;
  onConvertToClient: (contact: Contact, initialAmountCollected: number) => void;
}

const HotLeadsPage: React.FC<HotLeadsPageProps> = ({ hotLeads, onAddHotLead, onUpdateHotLead, onDeleteHotLead, selectedDate, onDateChange, handleSetAppointment, onConvertToClient }) => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Contact | null>(null);
  const [expandedFollowUps, setExpandedFollowUps] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');

  const filteredLeads = useMemo(() => {
    const sorted = [...hotLeads].sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime());
    if (!filterDate) {
        return sorted;
    }
    return sorted.filter(lead => lead.dateAdded && lead.dateAdded.startsWith(filterDate));
  }, [hotLeads, filterDate]);

  const handleLeadChange = (id: string, field: keyof Omit<Contact, 'id'>, value: string | number) => {
    const leadToUpdate = hotLeads.find(l => l.id === id);
    if (!leadToUpdate) return;
    const updatedValue = field === 'phone' ? formatPhoneNumber(String(value)) : value;
    onUpdateHotLead({ ...leadToUpdate, [field]: updatedValue });
  };

  const handleRemoveLead = (id: string) => {
    if (window.confirm("Are you sure you want to remove this hot lead?")) {
        onDeleteHotLead(id);
    }
  };

  const handleAddLead = () => {
    const newLead: Omit<Contact, 'id'> = {
      name: '', company: '', date: new Date().toISOString().split('T')[0], phone: '', email: '',
      interestLevel: 5, prospecting: {}, dateAdded: new Date().toISOString(), completedFollowUps: {}
    };
    onAddHotLead(newLead);
  };
  
  const handleOpenAppointmentModal = (lead: Contact) => {
      setSelectedLead(lead);
      setIsAppointmentModalOpen(true);
  };

  const handleOpenConvertToClientModal = (lead: Contact) => {
      setSelectedLead(lead);
      setIsConvertModalOpen(true);
  };
  
  const handleSaveAppointment = ({ date, time, note }: { date: string, time: string, note: string }) => {
    if (!selectedLead) return;
    const appointmentDate = new Date(`${date}T${time}`);
    handleSetAppointment({ client: selectedLead.name, lead: 'Hot Lead', time: time, details: note }, appointmentDate);
    onUpdateHotLead({ ...selectedLead, appointmentDate: date });
    setIsAppointmentModalOpen(false);
  };

  const handleConfirmConvertToClient = (amount: number) => {
    if (!selectedLead) return;
    onConvertToClient(selectedLead, amount);
    setIsConvertModalOpen(false);
  }

  const handleQuickSetAppointment = (data: { name: string, phone: string, email: string, date: string, time: string, interestLevel: number }) => {
    const appointmentDate = new Date(`${data.date}T${data.time}`);
    handleSetAppointment({ client: data.name, lead: 'Hot Lead', time: data.time }, appointmentDate);
  };
  
  const handleQuickAddToHotLeads = (data: { name: string, phone: string, email: string, interestLevel: number }) => {
    const newLead: Omit<Contact, 'id'> = {
        name: data.name, company: '', date: new Date().toISOString().split('T')[0], phone: data.phone, email: data.email,
        interestLevel: data.interestLevel, prospecting: {}, dateAdded: new Date().toISOString(), completedFollowUps: {}
    };
    onAddHotLead(newLead);
    alert(`${data.name} added to Hot Leads!`);
  };

  return (
    <>
     <SetAppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} onSave={handleSaveAppointment} contact={selectedLead} />
     <ConvertToClientModal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} onSave={handleConfirmConvertToClient} contact={selectedLead} />
     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-8">
            <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
             <QuickActions onSetAppointment={handleQuickSetAppointment} onAddToHotLeads={handleQuickAddToHotLeads} />
        </div>
        <div className="lg:col-span-9">
            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">Hot Leads</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Filter Date:</label>
                        <DatePicker value={filterDate} onChange={setFilterDate} className="w-32" />
                        {filterDate && <button onClick={() => setFilterDate('')} className="text-red-500 hover:text-red-400 font-bold text-xl" title="Clear filter">&times;</button>}
                    </div>
                    <button onClick={handleAddLead} className="bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm whitespace-nowrap">+ Add New Lead</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 col-span-full">
                    {filterDate ? `No hot leads acquired on ${filterDate}.` : 'No hot leads yet. Add some from the Prospecting page!'}
                  </div>
                ) : (
                  filteredLeads.map(lead => (
                    <HotLeadCard
                      key={lead.id}
                      lead={lead}
                      onEdit={() => { /* We will implement a proper edit modal later */ alert('Edit functionality coming soon!'); }}
                      onConvert={() => handleOpenConvertToClientModal(lead)}
                      onSchedule={() => handleOpenAppointmentModal(lead)}
                      onEmail={() => { /* TODO: Implement email tracking */ alert(`Simulating email to ${lead.email}`); }}
                    />
                  ))
                )}
              </div>
            </div>
        </div>
    </div>
    </>
  );
};

export default HotLeadsPage;
