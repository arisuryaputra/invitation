import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold tracking-tight sm:text-5xl">
            Create Your Perfect Digital Invitation
          </CardTitle>
          <CardDescription className="mt-4 text-lg text-muted-foreground">
            Design beautiful, custom online invitations with our easy-to-use drag-and-drop editor. Perfect for weddings, birthdays, and any special event. Get started in seconds.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/create">Create Your Invitation Now</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}