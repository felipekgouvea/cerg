"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogInIcon, LogOutIcon, MenuIcon } from "lucide-react";
import Link from "next/link";

const Menu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="cursor-pointer">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="px-5">
          <>
            <div className="flex justify-between space-y-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/felipekgouvea.png" />
                  <AvatarFallback>FK</AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="font-semibold">Felipe Kinupes Gouvêa</h3>
                  <span className="text-muted-foreground block text-xs">
                    felipekinupesg@hotmail.com
                  </span>
                </div>
              </div>
              <Button variant="outline" size="icon">
                <LogOutIcon />
              </Button>
            </div>
          </>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Olá. Faça seu login!</h2>
            <Button size="icon" asChild variant="outline">
              <Link href="/authentication">
                <LogInIcon />
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Menu;
