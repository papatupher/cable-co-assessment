import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ServiceNotesPanelProps {
  serviceRequestId: number;
}

/**
 * ServiceNotesPanel — displays and manages internal notes for a service request.
 *
 * This component:
 * 1. Lists existing notes with author and timestamp
 * 2. Allows adding new notes via a textarea
 * 3. Provides delete functionality for each note
 * 4. Handles loading, error, and empty states
 */
export default function ServiceNotesPanel({ serviceRequestId }: ServiceNotesPanelProps) {
  const [newNoteContent, setNewNoteContent] = useState("");
  const utils = trpc.useUtils();

  // Fetch notes for this service request
  const { data, isLoading, error } = trpc.serviceNotes.list.useQuery({
    serviceRequestId,
  });

  // Mutation for adding notes
  const addNote = trpc.serviceNotes.add.useMutation({
    onSuccess: () => {
      // Clear the textarea and refetch notes
      setNewNoteContent("");
      utils.serviceNotes.list.invalidate({ serviceRequestId });
    },
  });

  // Mutation for deleting notes
  const deleteNote = trpc.serviceNotes.delete.useMutation({
    onSuccess: () => {
      // Refetch notes to update the list
      utils.serviceNotes.list.invalidate({ serviceRequestId });
    },
  });

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      addNote.mutate({
        serviceRequestId,
        content: newNoteContent.trim(),
      });
    }
  };

  const handleDeleteNote = (noteId: number) => {
    deleteNote.mutate({ noteId });
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4 border-destructive">
        <CardHeader>
          <CardTitle className="text-lg">Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">
            Error loading notes: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const notes = data?.notes ?? [];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Internal Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new note form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add an internal note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim() || addNote.isPending}
              size="sm"
            >
              {addNote.isPending ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </div>

        {/* Notes list */}
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No internal notes yet.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {note.authorName || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={deleteNote.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
