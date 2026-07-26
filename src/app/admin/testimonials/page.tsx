"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { getTestimonials, updateTestimonialStatusAction, deleteTestimonialAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, Trash2, Star } from "lucide-react";
import type { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [viewingTestimonial, setViewingTestimonial] = useState<Testimonial | null>(null);

  const fetchData = useCallback(async () => {
    const data = await getTestimonials();
    setTestimonials(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleApprove(id: string) {
    setApproving(id);
    await updateTestimonialStatusAction(id, "approved");
    await fetchData();
    setApproving(null);
  }

  async function handleReject(id: string) {
    setApproving(id);
    await updateTestimonialStatusAction(id, "rejected");
    await fetchData();
    setApproving(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    setDeleting(id);
    await deleteTestimonialAction(id);
    await fetchData();
    setDeleting(null);
  }

  const pending = testimonials.filter((t) => t.status === "pending");
  const approved = testimonials.filter((t) => t.status === "approved");
  const rejected = testimonials.filter((t) => t.status === "rejected");

  const stats = {
    total: testimonials.length,
    pending: pending.length,
    approved: approved.length,
    avgRating:
      testimonials.length > 0
        ? (
            testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
          ).toFixed(1)
        : "0",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer reviews and feedback
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total
          </p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Approved
          </p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Avg Rating
          </p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <p className="text-2xl font-bold">{stats.avgRating}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-secondary h-11 mb-6">
          <TabsTrigger value="pending" className="rounded-lg">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending testimonials</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-4 rounded-xl bg-card border border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {testimonial.location}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 cursor-pointer hover:underline"
                        onClick={() => setViewingTestimonial(testimonial)}
                      >
                        {testimonial.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(testimonial.id)}
                        disabled={approving === testimonial.id}
                        className="rounded-lg text-green-600 hover:text-green-700"
                      >
                        {approving === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(testimonial.id)}
                        disabled={approving === testimonial.id}
                        className="rounded-lg text-destructive hover:text-destructive"
                      >
                        {approving === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={deleting === testimonial.id}
                        className="rounded-lg text-destructive"
                      >
                        {deleting === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : approved.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No approved testimonials yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-4 rounded-xl bg-card border border-green-200/50 bg-green-50/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {testimonial.location}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-green-700 border-green-300">
                          ✓ Approved
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 cursor-pointer hover:underline"
                        onClick={() => setViewingTestimonial(testimonial)}
                      >
                        {testimonial.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={deleting === testimonial.id}
                        className="rounded-lg text-destructive"
                      >
                        {deleting === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : rejected.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No rejected testimonials</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rejected.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-4 rounded-xl bg-card border border-red-200/50 bg-red-50/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {testimonial.location}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-red-700 border-red-300">
                          ✗ Rejected
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 cursor-pointer hover:underline"
                        onClick={() => setViewingTestimonial(testimonial)}
                      >
                        {testimonial.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={deleting === testimonial.id}
                        className="rounded-lg text-destructive"
                      >
                        {deleting === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Details Modal */}
      {viewingTestimonial && (
        <Dialog open={true} onOpenChange={() => setViewingTestimonial(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewingTestimonial.name}</DialogTitle>
              <DialogDescription>
                {viewingTestimonial.location} • {new Date(viewingTestimonial.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < viewingTestimonial.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {viewingTestimonial.rating} out of 5
                </span>
              </div>
              <p className="text-foreground leading-relaxed">{viewingTestimonial.content}</p>
              <div className="pt-4 border-t flex gap-2">
                {viewingTestimonial.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(viewingTestimonial.id);
                        setViewingTestimonial(null);
                      }}
                      className="rounded-lg"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleReject(viewingTestimonial.id);
                        setViewingTestimonial(null);
                      }}
                      className="rounded-lg"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setViewingTestimonial(null)}
                  className="rounded-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
