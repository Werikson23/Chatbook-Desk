import Queue from "../models/Queue";
import Company from "../models/Company";
import User from "../models/User";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  company: Company | null;
  super: boolean;
  signatureEnabled: boolean;
  signatureTemplate: string;
  signatureChannels: string;
  signatureAutoMode: string;
  queues: Queue[];
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company: user.company,
    super: user.super,
    signatureEnabled: user.signatureEnabled,
    signatureTemplate: user.signatureTemplate,
    signatureChannels: user.signatureChannels,
    signatureAutoMode: user.signatureAutoMode,
    queues: user.queues
  };
};
