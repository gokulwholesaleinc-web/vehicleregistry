import { Heart, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VehicleStatsDisplayProps {
  stats: {
    likes: number;
    follows: number;
    comments: number;
  };
  isLiked?: boolean;
  isFollowing?: boolean;
  onLike?: () => void;
  onFollow?: () => void;
  onViewComments?: () => void;
  showActions?: boolean;
  className?: string;
}

export function VehicleStatsDisplay({
  stats,
  isLiked = false,
  isFollowing = false,
  onLike,
  onFollow,
  onViewComments,
  showActions = true,
  className
}: VehicleStatsDisplayProps) {
  return (
    <div className={cn("flex items-center gap-4", className)} data-testid="vehicle-stats">
      {/* Likes */}
      <div className="flex items-center gap-2">
        {showActions && onLike ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={cn(
              "h-8 px-2 text-muted-foreground hover:text-red-500",
              isLiked && "text-red-500"
            )}
            data-testid="button-like"
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </Button>
        ) : (
          <Heart className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground" data-testid="text-likes-count">
          {stats.likes}
        </span>
      </div>

      {/* Follows */}
      <div className="flex items-center gap-2">
        {showActions && onFollow ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFollow}
            className={cn(
              "h-8 px-2 text-muted-foreground hover:text-blue-500",
              isFollowing && "text-blue-500"
            )}
            data-testid="button-follow"
          >
            <Users className="h-4 w-4" />
          </Button>
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground" data-testid="text-follows-count">
          {stats.follows}
        </span>
      </div>

      {/* Comments */}
      <div className="flex items-center gap-2">
        {showActions && onViewComments ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewComments}
            className="h-8 px-2 text-muted-foreground hover:text-green-500"
            data-testid="button-comments"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        ) : (
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground" data-testid="text-comments-count">
          {stats.comments}
        </span>
      </div>
    </div>
  );
}