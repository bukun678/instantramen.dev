import { ComponentType } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BookOpenText,
  Box,
  Brain,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Folder,
  Github,
  HelpCircle,
  History,
  Home,
  Key,
  Mail,
  Menu,
  MessageCircle,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Zap,
} from 'lucide-react';
import {
  RiAddLine,
  RiBarChart2Line,
  RiChat2Line,
  RiClapperboardAiLine,
  RiCloudy2Fill,
  RiCloudyFill,
  RiCodeFill,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiDiscordFill,
  RiEditLine,
  RiEyeLine,
  RiFlashlightFill,
  RiGithubFill,
  RiGoogleFill,
  RiImage2Line,
  RiKey2Fill,
  RiKeyLine,
  RiLockPasswordLine,
  RiMessage2Line,
  RiMusic2Line,
  RiNextjsFill,
  RiQuestionLine,
  RiRefreshLine,
  RiRobot2Line,
  RiTaskLine,
  RiTwitterXFill,
  RiVideoLine,
} from 'react-icons/ri';

type IconComponent = ComponentType<any>;

// Keep this registry explicit. Looking icons up from a dynamically imported
// namespace causes both complete icon libraries to be bundled into the Worker.
const remixIconRegistry: Record<string, IconComponent> = {
  RiAddLine,
  RiBarChart2Line,
  RiChat2Line,
  RiClapperboardAiLine,
  RiCloudy2Fill,
  RiCloudyFill,
  RiCodeFill,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiDiscordFill,
  RiEditLine,
  RiEyeLine,
  RiFlashlightFill,
  RiGithubFill,
  RiGoogleFill,
  RiImage2Line,
  RiKey2Fill,
  RiKeyLine,
  RiLockPasswordLine,
  RiMessage2Line,
  RiMusic2Line,
  RiNextjsFill,
  RiQuestionLine,
  RiRefreshLine,
  RiRobot2Line,
  RiTaskLine,
  RiTwitterXFill,
  RiVideoLine,
};

const lucideIconRegistry: Record<string, IconComponent> = {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BookOpenText,
  Box,
  Brain,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Folder,
  Github,
  HelpCircle,
  History,
  Home,
  Key,
  Mail,
  Menu,
  MessageCircle,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Zap,
};

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  const Icon = name?.startsWith('Ri')
    ? remixIconRegistry[name] || RiQuestionLine
    : lucideIconRegistry[name] || HelpCircle;

  return <Icon size={size} className={className} {...props} />;
}
