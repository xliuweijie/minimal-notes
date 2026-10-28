import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, screen, render as testingLibraryRender, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppSidebar, { MobileAppHeader, MobileAppSidebar } from "@/components/AppSidebar";
import { type MemoFilter } from "@/contexts/MemoFilterContext";
import { resolveCollectionRoute } from "@/router/routes";

const authState = vi.hoisted(() => ({
  currentUser: { name: "users/test" } as { name: string } | undefined,
  memoViews: [] as Array<{ name: string; title: string }>,
  notifications: [] as Array<{ status: number }>,
}));
const sidebarState = vi.hoisted(() => ({
  memoScope: "home" as "home" | "explore",
  mobileOpen: false,
  setMobileOpen: vi.fn(),
  setQuickFindOpen: vi.fn(),
}));
const globalEditorState = vi.hoisted(() => ({
  canOpen: true,
  openEditor: vi.fn(),
}));
const spaceState = vi.hoisted(() => ({
  spaces: [] as Array<{ name: string; title: string; description: string }>,
  selectedSpace: undefined as { name: string; title: string; description: string } | undefined,
  selectSpace: vi.fn(),
}));
const filteredStatsHook = vi.hoisted(() => vi.fn());
const filterState = vi.hoisted(() => ({ filters: [] as MemoFilter[] }));
const tagsSectionHook = vi.hoisted(() => vi.fn());

vi.mock("@/components/MemosLogo", () => ({
  default: ({ size }: { size?: string }) => <span data-logo-size={size}>Memos logo</span>,
}));

vi.mock("@/components/MemoDisplaySettingMenu", () => ({
  default: () => <button type="button">memo.view-options</button>,
}));

vi.mock("@/components/UserMenu", () => ({
  default: () => (
    <button type="button" className="w-full">
      User menu
    </button>
  ),
}));

vi.mock("@/components/CreateSpaceDialog", () => ({
  default: () => null,
}));

vi.mock("@/components/StatisticsView", () => ({
  default: () => <div>Calendar</div>,
}));

vi.mock("@/components/AppSidebar/TagsSection", () => ({
  default: (props: unknown) => {
    tagsSectionHook(props);
    return <div>Tags</div>;
  },
}));

vi.mock("@/contexts/AppSidebarContext", () => ({
  useAppSidebar: () => ({
    attachmentSection: "all",
    setAttachmentSection: vi.fn(),
    inboxFilter: "all",
    setInboxFilter: vi.fn(),
    memoDetail: undefined,
    setMemoDetail: vi.fn(),
    mobileOpen: sidebarState.mobileOpen,
    setMobileOpen: sidebarState.setMobileOpen,
    quickFindOpen: false,
    setQuickFindOpen: sidebarState.setQuickFindOpen,
    memoScope: sidebarState.memoScope,
    setMemoScope: vi.fn(),
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isInitialized: true }),
}));

vi.mock("@/contexts/GlobalMemoEditorContext", () => ({
  useGlobalMemoEditor: () => globalEditorState,
}));

vi.mock("@/contexts/InstanceContext", () => ({
  useInstance: () => ({ isInitialized: true }),
}));

vi.mock("@/contexts/MemoFilterContext", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/contexts/MemoFilterContext")>()),
  useMemoFilterContext: () => ({
    filters: filterState.filters,
    memoView: undefined,
    setMemoView: vi.fn(),
  }),
}));

vi.mock("@/contexts/SpaceContext", () => ({
  useSpaceContext: () => {
    const { spaceName } = resolveCollectionRoute(useLocation().pathname);
    const duplicateSpaceTitles = new Set(
      spaceState.spaces
        .filter((space, index) => spaceState.spaces.findIndex((candidate) => candidate.title === space.title) !== index)
        .map((space) => space.title),
    );
    return {
      ...spaceState,
      selectedSpaceName: spaceName,
      selectedSpace: spaceName ? spaceState.selectedSpace : undefined,
      memoFilter: spaceName ? `space == ${JSON.stringify(spaceName)}` : undefined,
      duplicateSpaceTitles,
      isLoadingSpaces: false,
      isSpacesError: false,
    };
  },
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  default: () => authState.currentUser,
}));

vi.mock("@/hooks/useFilteredMemoStats", () => ({
  useFilteredMemoStats: (options: unknown) => {
    filteredStatsHook(options);
    return { statistics: { activityStats: {}, timeBasis: "create_time" }, tags: {} };
  },
}));

vi.mock("@/hooks/useAttachmentLibrary", () => ({
  useAttachmentLibraryStats: () => ({ stats: { media: 0, documents: 0, audio: 0, unused: 0 } }),
}));

vi.mock("@/hooks/useMediaQuery", () => ({
  default: () => true,
}));

vi.mock("@/hooks/useUserQueries", () => ({
  userKeys: {
    memoViews: (parent?: string) => ["users", "memoViews", parent],
  },
  useMemoViews: () => ({ data: authState.memoViews }),
  useNotifications: () => ({ data: authState.notifications }),
  useUser: () => ({ data: undefined }),
}));

vi.mock("@/i18n", () => ({
  default: { language: "en" },
}));

vi.mock("@/utils/i18n", () => ({
  useTranslate: () => (key: string) => key,
}));

const render = (ui: Parameters<typeof testingLibraryRender>[0]) =>
  testingLibraryRender(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>,
  );

const renderSidebar = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppSidebar />
    </MemoryRouter>,
  );

describe("Minimal app sidebar", () => {
  beforeEach(() => {
    authState.currentUser = { name: "users/test" };
    authState.memoViews = [];
    authState.notifications = [];
    sidebarState.memoScope = "home";
    sidebarState.mobileOpen = false;
    globalEditorState.canOpen = true;
    spaceState.spaces = [];
    spaceState.selectedSpace = undefined;
    filterState.filters = [];
  });

  it("only shows notes, search and archive in primary navigation", () => {
    renderSidebar();
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(navigation)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["common.memos", "common.archived"]);
    expect(within(navigation).getAllByRole("button")).toHaveLength(1);
    expect(navigation).toHaveClass("flex-col");
    expect(screen.getByRole("link", { name: "common.memos" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "common.memos" })).toHaveClass("h-9");
  });

  it("shows a simple brand link instead of a space dropdown", () => {
    renderSidebar();
    const brand = screen.getByRole("link", { name: "Memos logo" });
    expect(brand).toHaveAttribute("href", "/");
    expect(brand).toHaveClass("h-9", "gap-2", "px-2");
    expect(screen.queryByRole("button", { name: /space.switch/ })).not.toBeInTheDocument();
    fireEvent.click(brand);
    expect(sidebarState.setMobileOpen).toHaveBeenCalledWith(false);
  });

  it("opens the existing global editor from the header", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "editor.new-memo" }));
    expect(globalEditorState.openEditor).toHaveBeenCalledOnce();
  });

  it("opens search and closes mobile navigation", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "common.search" }));
    expect(sidebarState.setQuickFindOpen).toHaveBeenCalledWith(true);
    expect(sidebarState.setMobileOpen).toHaveBeenCalledWith(false);
  });

  it.each([
    "/",
    "/explore",
    "/archived",
    "/u/test",
    "/calendar",
    "/map",
    "/about",
    "/404",
  ])("does not show statistics, tags, saved views or resources on %s", (path) => {
    renderSidebar(path);
    expect(screen.queryByText("Calendar")).not.toBeInTheDocument();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "common.views" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "common.resources" })).not.toBeInTheDocument();
    expect(filteredStatsHook).not.toHaveBeenCalled();
    expect(tagsSectionHook).not.toHaveBeenCalled();
  });

  it("keeps the selected space when returning to notes", () => {
    renderSidebar("/spaces/product/attachments");
    expect(screen.getByRole("link", { name: "common.memos" })).toHaveAttribute("href", "/spaces/product");
    expect(screen.getByRole("link", { name: "Memos logo" })).toHaveAttribute("href", "/spaces/product");
    expect(screen.getByRole("link", { name: "common.archived" })).toHaveAttribute("href", "/archived");
    expect(screen.queryByRole("button", { name: "attachment-library.labels.unused" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "attachment-library.tabs.media" })).toBeInTheDocument();
  });

  it("marks archive as current without also selecting notes", () => {
    renderSidebar("/Archived/");
    expect(screen.getByRole("link", { name: "common.archived" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "common.memos" })).not.toHaveAttribute("aria-current");
  });

  it("closes the drawer when navigating to archive", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("link", { name: "common.archived" }));
    expect(screen.getByRole("link", { name: "common.archived" })).toHaveAttribute("aria-current", "page");
    expect(sidebarState.setMobileOpen).toHaveBeenCalledWith(false);
  });

  it("keeps the existing account menu in a single footer", () => {
    renderSidebar();
    expect(screen.getByRole("button", { name: "User menu" }).closest("footer")?.childElementCount).toBe(1);
  });

  it("hides compose when the editor is unavailable", () => {
    globalEditorState.canOpen = false;
    renderSidebar();
    expect(screen.queryByRole("button", { name: "editor.new-memo" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "common.search" })).toBeInTheDocument();
  });

  it("gives guests only public notes, search and sign in", () => {
    authState.currentUser = undefined;
    globalEditorState.canOpen = false;
    renderSidebar("/explore");
    expect(screen.getByRole("link", { name: "common.memos" })).toHaveAttribute("href", "/explore");
    expect(screen.getByRole("link", { name: "common.sign-in-to-memos" })).toHaveAttribute("href", "/auth");
    expect(screen.queryByRole("link", { name: "common.archived" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "User menu" })).not.toBeInTheDocument();
  });

  it("keeps the mobile header limited to navigation and branding", () => {
    render(
      <MemoryRouter>
        <MobileAppHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("data-mobile-navigation-trigger");
    expect(screen.getByRole("link", { name: "Memos logo" })).toHaveClass("h-9", "gap-1.5", "px-1");
    expect(screen.queryByRole("button", { name: "common.search" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "editor.new-memo" })).not.toBeInTheDocument();
  });

  it("exposes compose and search inside the mobile drawer", () => {
    sidebarState.mobileOpen = true;
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <MobileAppSidebar />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: "common.search" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "editor.new-memo" }));
    expect(globalEditorState.openEditor).toHaveBeenCalledOnce();
  });

  it("keeps an accessible close control in the mobile drawer", () => {
    sidebarState.mobileOpen = true;
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <MobileAppSidebar />
      </MemoryRouter>,
    );
    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toHaveAttribute("data-slot", "sheet-close");
    fireEvent.click(close);
    expect(sidebarState.setMobileOpen.mock.calls.at(-1)?.[0]).toBe(false);
  });
});
