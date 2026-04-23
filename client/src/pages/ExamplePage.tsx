import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ServiceNotesPanel from "@/components/ServiceNotesPanel";

/**
 * Example page demonstrating how to use tRPC hooks in the frontend.
 *
 * Study this pattern:
 * 1. useQuery for fetching data
 * 2. useMutation for modifying data
 * 3. Cache invalidation after mutations
 * 4. Loading, error, and empty states
 *
 * YOUR TASK: Build a ServiceNotesPanel component following this pattern.
 */
export default function ExamplePage() {
  const utils = trpc.useUtils();

  // Fetch service requests
  const { data, isLoading, error } = trpc.example.list.useQuery();

  // Mutation with cache invalidation
  const updateStatus = trpc.example.updateStatus.useMutation({
    onSuccess: () => {
      // Invalidate the list query to refetch fresh data
      utils.example.list.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading service requests: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requests = data?.requests ?? [];

  return (
    <div className="container py-16">
      <h1 className="text-2xl font-bold mb-6">Service Requests</h1>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No service requests found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <Card key={req.id}>
              <CardHeader>
                <CardTitle className="text-lg">{req.subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {req.clientName} — {req.clientEmail}
                </p>
                <p className="text-sm mb-4">{req.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                    {req.status}
                  </span>
                  {req.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatus.mutate({
                          id: req.id,
                          status: "in_progress",
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      Start Work
                    </Button>
                  )}
                </div>

                <ServiceNotesPanel serviceRequestId={req.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
