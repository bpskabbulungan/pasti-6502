import { memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/date-format";
import { Role } from "@/shared/constants/enums";
import type { UserSummary } from "@shared/types/users";

type UsersTableRowProps = {
  user: UserSummary;
  onEdit: (user: UserSummary) => void;
  onDelete: (user: UserSummary) => void;
};

const getInitials = (value: string) => {
  if (!value) return "AD";
  const parts = value.trim().split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatRelativeTime = (value: string | Date) => {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} minggu lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
};

function UsersTableRowComponent({ user, onEdit, onDelete }: UsersTableRowProps) {
  const isAdmin = user.role === Role.ADMIN;
  const roleLabel = isAdmin ? "Admin" : "Petugas";
  const createdDate = formatDisplayDate(user.createdAt);
  const createdRelative = formatRelativeTime(user.createdAt);

  return (
    <>
      <TableRow className="hidden md:table-row">
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="bg-primary/10 text-primary-color">
              <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-primary-color">{user.name}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <p className="text-xs text-secondary-color">@{user.username}</p>
        </TableCell>
        <TableCell className="text-center">
          <p className="text-xs text-secondary-color">{user.phone || "No. WA belum diisi"}</p>
        </TableCell>
        <TableCell className="text-center">
          <Badge
            variant={isAdmin ? "secondary" : "outline"}
            className={`border-border ${isAdmin ? "bg-primary/10 text-primary-color" : "bg-accent/10 text-accent"}`}
          >
            {roleLabel}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <div className="space-y-1 text-sm">
            <p className="font-medium text-primary-color">{createdDate}</p>
            <p className="text-xs text-secondary-color">{createdRelative}</p>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(user)}
              disabled={isAdmin}
              title={isAdmin ? "Akun admin tidak dapat diedit" : "Edit pengguna"}
              aria-label="Edit pengguna"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(user)}
              disabled={isAdmin}
              title={isAdmin ? "Akun admin tidak dapat dihapus" : "Hapus pengguna"}
              aria-label="Hapus pengguna"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="border-0 md:hidden hover:bg-transparent">
        <TableCell colSpan={6} className="p-0 whitespace-normal">
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="bg-primary/10 text-primary-color">
                  <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-primary-color">{user.name}</p>
                  <p className="text-xs text-secondary-color">@{user.username}</p>
                  <p className="text-xs text-secondary-color">{user.phone || "No. WA belum diisi"}</p>
                </div>
              </div>
              <Badge
                variant={isAdmin ? "secondary" : "outline"}
                className={`border-border ${isAdmin ? "bg-primary/10 text-primary-color" : "bg-accent/10 text-accent"}`}
              >
                {roleLabel}
              </Badge>
            </div>
            <div className="mt-3 space-y-1 text-xs text-secondary-color">
              <p className="text-primary-color">{createdDate}</p>
              <p>{createdRelative}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(user)}
                disabled={isAdmin}
                title={isAdmin ? "Akun admin tidak dapat diedit" : "Edit pengguna"}
                aria-label="Edit pengguna"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(user)}
                disabled={isAdmin}
                title={isAdmin ? "Akun admin tidak dapat dihapus" : "Hapus pengguna"}
                aria-label="Hapus pengguna"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

const UsersTableRow = memo(UsersTableRowComponent);

UsersTableRow.displayName = "UsersTableRow";

export default UsersTableRow;
