"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Megaphone,
  LayoutTemplate,
  TicketPercent,
  Contact2,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Store Settings</h2>
        <p className="text-muted-foreground mt-1">
          Configure your core features and store appearances.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:bg-secondary/40 transition-colors border-border rounded-md shadow-sm"
          onClick={() => router.push("/admin/settings/marquee")}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2.5 bg-primary/10 rounded-full text-primary">
              <Megaphone size={20} />
            </div>
            <CardTitle className="text-lg">Announcement Bar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage the scrolling marquee texts displayed at the top of your
              website.
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-secondary/40 transition-colors border-border rounded-md shadow-sm"
          onClick={() => router.push("/admin/settings/hero-section")}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2.5 bg-primary/10 rounded-full text-primary">
              <LayoutTemplate size={20} />
            </div>
            <CardTitle className="text-lg">Hero Section</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Control the main homepage banners and promotional video reel.
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-secondary/40 transition-colors border-border rounded-md shadow-sm"
          onClick={() => router.push("/admin/settings/sales-banner")}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2.5 bg-primary/10 rounded-full text-primary">
              <TicketPercent size={20} />
            </div>
            <CardTitle className="text-lg">Sales Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload promotional graphics and link them to specific collections
              or deals.
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-secondary/40 transition-colors border-border rounded-md shadow-sm"
          onClick={() => router.push("/admin/settings/contact-info")}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2.5 bg-primary/10 rounded-full text-primary">
              <Contact2 size={20} />
            </div>
            <CardTitle className="text-lg">Contact Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update company address, emails, phone numbers, and social media
              links.
            </p>
          </CardContent>
        </Card>

        {/* FIXED CARD: Notifications (Now matches exact UI of other cards) */}
        <Card
          className="cursor-pointer hover:bg-secondary/40 transition-colors border-border rounded-md shadow-sm"
          onClick={() => router.push("/admin/settings/notifications")}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2.5 bg-primary/10 rounded-full text-primary">
              <Bell size={20} />
            </div>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure Telegram Bot integration to receive real-time order and
              contact alerts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
