// src/components/HotLeadCard.tsx

import React from 'react';
import { Contact } from '../types';
import { Mail, Phone, Calendar, Edit, CheckCircle, Clock } from 'lucide-react';

interface HotLeadCardProps {
  lead: Contact;
  onEdit: (lead: Contact) => void;
  onConvert: (lead: Contact) => void;
  onSchedule: (lead: Contact) => void;
  onEmail: (lead: Contact) => void;
}

const HotLeadCard: React.FC<HotLeadCardProps> = ({ lead, onEdit, onConvert, onSchedule, onEmail }) => {
  const followUpProgress = lead.completedFollowUps || 0;
  const totalFollowUps = 30; // Assuming a 30-day follow-up plan
  const progressPercent = Math.min(100, (followUpProgress / totalFollowUps) * 100);

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg shadow-lg border border-brand-light-border dark:border-brand-gray flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-brand-blue dark:text-brand-lime truncate">{lead.name}</h3>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Added: {new Date(lead.dateAdded).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-2 text-sm flex-grow">
        <p className="flex items-center">
          <span className="font-semibold w-20">Company:</span> {lead.company || 'N/A'}
        </p>
        <p className="flex items-center">
          <Phone className="w-4 h-4 mr-2 text-brand-lime" /> {lead.phone || 'N/A'}
        </p>
        <p className="flex items-center">
          <Mail className="w-4 h-4 mr-2 text-brand-lime" /> {lead.email || 'N/A'}
        </p>
        <p className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-brand-lime" /> Appt: {lead.appointmentDate ? new Date(lead.appointmentDate).toLocaleDateString() : 'Not Set'}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-brand-light-border dark:border-brand-gray">
        <div className="text-xs font-semibold mb-1">Follow-up Progress ({followUpProgress} / {totalFollowUps} days)</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-brand-lime h-2.5 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between mt-4 space-x-2">
        <button
          onClick={() => onEmail(lead)}
          className="flex-1 flex items-center justify-center text-xs bg-brand-blue text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Mail className="w-3 h-3 mr-1" /> Email
        </button>
        <button
          onClick={() => onSchedule(lead)}
          className="flex-1 flex items-center justify-center text-xs bg-brand-red text-white py-2 rounded-lg hover:bg-red-700 transition"
        >
          <Calendar className="w-3 h-3 mr-1" /> Schedule
        </button>
        <button
          onClick={() => onConvert(lead)}
          className="flex-1 flex items-center justify-center text-xs bg-brand-lime text-brand-ink py-2 rounded-lg hover:bg-green-400 transition"
        >
          <CheckCircle className="w-3 h-3 mr-1" /> Convert
        </button>
      </div>
    </div>
  );
};

export default HotLeadCard;
