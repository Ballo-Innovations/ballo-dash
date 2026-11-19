import { ReactNode, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  changeThemeLayout,
  changeThemeMode,
  changeThemePreset,
} from "../toolkit/thunk";
import {
  changeLayoutTheme,
  changeSidebarTheme,
  changeSidebarThemeCaptions,
} from "../toolkit/themeLayouts/thunk";
import type { AppDispatch, RootState } from "../toolkit";
import RightCustomizer from "./RightCustomizer";
import Header from "./Header";
import TopBar from "./Topbar";
import IntegrationManagementModal from "@/views/Dashboard/IntegrationManagementModal";

interface LayoutProps {
  children: ReactNode;
}

const selectLayoutProperties = createSelector(
  (state: RootState) => state.Theme,
  (layout) => ({
    themeMode: layout.themeMode,
    layoutTheme: layout.layoutTheme,
    themePreset: layout.themePreset,
    themeLayout: layout.themeLayout,
    sidebarTheme: layout.sidebarTheme,
    sidebarThemeCaptions: layout.sidebarThemeCaptions,
  })
);

/**
 * Application shell: vertical sidebar, top bar and theme customizer.
 * The template's horizontal, tab and modular variants were removed (H-07).
 */
const Layout = ({ children }: LayoutProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    themeMode,
    themePreset,
    layoutTheme,
    themeLayout,
    sidebarTheme,
    sidebarThemeCaptions,
  } = useSelector(selectLayoutProperties);

  useEffect(() => {
    dispatch(changeThemeMode(themeMode));
    dispatch(changeLayoutTheme(layoutTheme));
    dispatch(changeThemePreset(themePreset));
    dispatch(changeThemeLayout(themeLayout));
    dispatch(changeSidebarTheme(sidebarTheme));
    dispatch(changeSidebarThemeCaptions(sidebarThemeCaptions));
  }, [
    themeMode,
    layoutTheme,
    themePreset,
    themeLayout,
    sidebarTheme,
    sidebarThemeCaptions,
    dispatch,
  ]);

  const toogleSidebarHide = useCallback(() => {
    document.getElementById("pc-sidebar-hide")?.classList.toggle("pc-sidebar-hide");
  }, []);

  const toogleMobileSidebarHide = useCallback(() => {
    const sidebar = document.getElementById("pc-sidebar-hide");
    if (!sidebar) return;
    sidebar.classList.toggle("mob-sidebar-active");

    const overlay = document.createElement("div");
    overlay.className = "pc-menu-overlay";
    document.querySelector(".navbar-wrapper")?.insertAdjacentElement("afterend", overlay);
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("mob-sidebar-active");
      overlay.remove();
    });
  }, []);

  const [isLayoutWidth, setLayoutWidth] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const handleOffcanvasToggle = () => setShowOffcanvas((open) => !open);

  return (
    <>
      <Header themeMode={themeMode} />
      <TopBar
        handleOffcanvasToggle={handleOffcanvasToggle}
        toogleSidebarHide={toogleSidebarHide}
        toogleMobileSidebarHide={toogleMobileSidebarHide}
        themeMode={themeMode}
        changeThemeMode={changeThemeMode}
      />
      <div className="pc-container">
        <div className={"pc-content " + (isLayoutWidth ? "container" : "")}>
          {children}
        </div>
      </div>
      <RightCustomizer
        showOffcanvas={showOffcanvas}
        handleOffcanvasToggle={handleOffcanvasToggle}
        themeMode={themeMode}
        changeThemeMode={changeThemeMode}
        themePreset={themePreset}
        changeThemePreset={changeThemePreset}
        themeLayout={themeLayout}
        changeThemeLayout={changeThemeLayout}
        isLayoutWidth={isLayoutWidth}
        handleChangeLayoutWidth={setLayoutWidth}
        sidebarTheme={sidebarTheme}
        changeSidebarTheme={changeSidebarTheme}
        sidebarThemeCaptions={sidebarThemeCaptions}
        changeSidebarThemeCaptions={changeSidebarThemeCaptions}
      />
      <IntegrationManagementModal />
    </>
  );
};

export default Layout;
