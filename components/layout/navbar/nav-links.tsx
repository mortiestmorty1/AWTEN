'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from '@headlessui/react';
import { navbarData, paths } from '@/lib/constants';
import { Button, IconButton, Logo } from '@/components/ui';
import { UserIcon, MenuIcon, XIcon } from '@/components/ui/icons/dashboard';
import { NavLink } from './nav-link';

interface NavLinksProps {
  user?: User | null;
}

export const NavLinks = ({ user }: NavLinksProps) => {
  const router = useRouter();

  return (
    <Disclosure as="nav" className="w-full text-default-fg">
      {({ open, close }) => (
        <>
          <div
            className={`mx-auto max-w-screen-xl p-3.5 lg:px-0 ${open ? 'h-full max-lg:bg-canvas-on-canvas' : ''}`}
          >
            <div className="relative flex items-center justify-between">
              <Link
                href={paths.home}
                className="flex items-center flex-1 flex-shrink-0 cursor-pointer"
              >
                <Logo />
              </Link>
              <NavLink
                className="justify-center flex-1 hidden gap-6 lg:gap-10 lg:flex"
                links={navbarData}
              />
              <div className="flex lg:hidden">
                <DisclosureButton className="z-50 rounded-md text-canvas-text-contrast p-2">
                  <IconButton
                    as="div"
                    variant="primary"
                    size="medium"
                    type="ghost"
                    icon={
                      open ? (
                        <XIcon
                          aria-hidden="true"
                          className="z-30 flex text-canvas-text-contrast w-5 h-5"
                        />
                      ) : (
                        <MenuIcon
                          aria-hidden="true"
                          className="text-canvas-text-contrast w-5 h-5"
                        />
                      )
                    }
                  />
                </DisclosureButton>
              </div>
              <div className="items-center justify-end flex-1 hidden lg:flex">
                {user ? (
                  <div className="flex items-center gap-1">
                    <Link href={paths.user.dashboard}>
                      <Button
                        as="div"
                        color="primary"
                        variant="solid"
                        size="medium"
                      >
                        Account
                      </Button>
                    </Link>
                    <button
                      onClick={() => router.push('/dashboard/account')}
                      className="relative flex items-center justify-center w-10 h-10 text-sm border rounded-full border-canvas-line bg-canvas-bg-subtle focus:outline-none"
                    >
                      <span className="sr-only">Open user menu</span>
                      <UserIcon className="h-[1.07rem] w-[1.07rem]" />
                    </button>
                  </div>
                ) : (
                  <Link href={paths.auth.signin}>
                    <Button color="primary" variant="solid" size="medium">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <DisclosurePanel className="lg:hidden">
            <div className="fixed top-[68px] z-20 flex h-full w-full flex-col gap-9 bg-canvas-on-canvas px-3.5 py-[22px]">
              <NavLink
                className="flex flex-col gap-3"
                links={navbarData}
                onClick={() => close()}
              />
              {user ? (
                <div className="gap-3 lg:hidden">
                  <Link href={paths.user.dashboard}>
                    <Button
                      as="div"
                      color="primary"
                      variant="solid"
                      size="medium"
                    >
                      Account
                    </Button>
                  </Link>
                  <button className="relative hidden px-2 text-sm border rounded-full border-canvas-line focus:outline-none">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <Link href="/dashboard/account">
                      <UserIcon className="w-6 h-6 text-canvas-text" />
                    </Link>
                  </button>
                </div>
              ) : (
                <Link href={paths.auth.signin} className="flex lg:hidden">
                  <Button color="primary" variant="solid" size="medium">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};
