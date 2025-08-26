import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from '../services/types';
import { cn } from '../lib/utils';

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackClassName?: string;
  showInitials?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-10 w-10',
  xl: 'h-20 w-20'
};

const fallbackSizeClasses = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-lg'
};

export default function UserAvatar({ 
  user, 
  size = 'md', 
  className, 
  fallbackClassName,
  showInitials = true 
}: UserAvatarProps) {
  const getInitials = (user: User) => {
    const firstInitial = user.firstName?.[0]?.toUpperCase() || '';
    const lastInitial = user.lastName?.[0]?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const getUserName = (user: User) => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  if (!user) {
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarFallback className={cn(
          'bg-muted text-muted-foreground',
          fallbackSizeClasses[size],
          fallbackClassName
        )}>
          ?
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.profilePicture && (
        <AvatarImage 
          src={user.profilePicture} 
          alt={getUserName(user)}
          className="object-cover"
        />
      )}
      <AvatarFallback className={cn(
        'bg-primary text-primary-foreground font-medium',
        fallbackSizeClasses[size],
        fallbackClassName
      )}>
        {showInitials ? getInitials(user) : '?'}
      </AvatarFallback>
    </Avatar>
  );
}
