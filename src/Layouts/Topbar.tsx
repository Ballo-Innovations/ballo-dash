/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-children-prop */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
/* eslint-disable no-console */
import AlertBell from "@/components/topbar/AlertBell";
import BrandFilter from "@/components/topbar/BrandFilter";
import PeriodPicker from "@/components/topbar/PeriodPicker";
import { roleLabel } from "@/lib/roles";
import { THEME_MODE } from "../Common/layoutConfig";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { Button, Dropdown, DropdownToggle } from "react-bootstrap";
import { useDispatch } from "react-redux";
import SimpleBar from "simplebar-react";
import { chanageLanguage } from "src/toolkit/themeLayouts/thunk";
import { useSession } from "@/contexts/SessionContext";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";

//import images
import avatar1 from "../assets/images/user/avatar-1.jpg";
import avatar2 from "../assets/images/user/avatar-2.jpg";
import avatar3 from "../assets/images/user/avatar-3.jpg";
import i18n from "src/utils/i18n";
import { Cable, UserRound } from "lucide-react";
import { useIntegrationModal } from "@/hooks/useIntegrationModal";

interface HeaderProps {
  themeMode?: string; // Define the type for themeMode
  changeThemeMode?: any; // Define the type for changeThemeMode function
  toogleSidebarHide?: () => void;
  toogleMobileSidebarHide?: () => void;
  handleOffcanvasToggle?: () => void;
}

const TopBar = ({
  handleOffcanvasToggle,
  changeThemeMode,
  toogleSidebarHide,
  toogleMobileSidebarHide,
}: HeaderProps) => {
  const dispatch = useDispatch<any>();
  const { openIntegrationModal } = useIntegrationModal();
  const handleLanguageChange = (language: string) => {
    dispatch(chanageLanguage(language));
    i18n.changeLanguage(language);
  };

  // Function to handle theme mode change
  const handleThemeChange = (value: any) => {
    dispatch(changeThemeMode(value));
  };

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const { data: session, signOut } = useSession();

  return (
    <React.Fragment>
      <header className="pc-header">
        <div className="header-wrapper">
          <div className="me-auto pc-mob-drp">
            <ul className="list-unstyled">
              <li className="pc-h-item pc-sidebar-collapse">
                <button
                  type="button"
                  className="pc-head-link ms-0"
                  id="sidebar-hide"
                  onClick={toogleSidebarHide}
                  aria-label="Show or hide the menu"
                >
                  <i className="ti ti-menu-2" aria-hidden="true"></i>
                </button>
              </li>
              <li className="pc-h-item pc-sidebar-popup">
                <button
                  type="button"
                  className="pc-head-link ms-0"
                  id="mobile-collapse"
                  onClick={toogleMobileSidebarHide}
                  aria-label="Open the menu"
                >
                  <i className="ti ti-menu-2" aria-hidden="true"></i>
                </button>
              </li>
              <Dropdown as="li" className="pc-h-item d-inline-flex d-md-none">
                <Dropdown.Toggle
                  as="a"
                  className="pc-head-link arrow-none m-0"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="false"
                  aria-expanded="false"
                >
                  <i className="ph-duotone ph-magnifying-glass"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="pc-h-dropdown drp-search">
                  <form className="px-3">
                    <div className="form-group mb-0 d-flex align-items-center">
                      <input
                        type="search"
                        className="form-control border-0 shadow-none"
                        placeholder="Search here. . ."
                      />
                      <button className="btn btn-light-secondary btn-search">
                        Search
                      </button>
                    </div>
                  </form>
                </Dropdown.Menu>
              </Dropdown>
              <li className="pc-h-item d-none d-md-inline-flex">
                <form className="form-search">
                  <i className="ph-duotone ph-magnifying-glass icon-search"></i>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search..."
                  />
                  <button className="btn btn-search" style={{ padding: "0" }}>
                    <kbd>ctrl+k</kbd>
                  </button>
                </form>
              </li>
              <PeriodPicker />
              <BrandFilter />
            </ul>
          </div>

          <div className="ms-auto">
            <ul className="list-unstyled">
              {/* <Dropdown
                as="li"
                className="dropdown pc-h-item d-none d-md-inline-flex"
              >
                <Dropdown.Toggle
                  as="a"
                  className="pc-head-link dropdown-toggle arrow-none me-0"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="false"
                  aria-expanded="false"
                >
                  <i className="ph-duotone ph-circles-four"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu dropdown-qta dropdown-menu-end pc-h-dropdown">
                  <div className="overflow-hidden">
                    <div className="qta-links m-n1">
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-shopping-cart"></i>
                        <span>E-commerce</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-lifebuoy"></i>
                        <span>Helpdesk</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-scroll"></i>
                        <span>Invoice</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-books"></i>
                        <span>Online Courses</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-envelope-open"></i>
                        <span>Mail</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-identification-badge"></i>
                        <span>Membership</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-chats-circle"></i>
                        <span>Chat</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-currency-circle-dollar"></i>
                        <span>Plans</span>
                      </Dropdown.Item>
                      <Dropdown.Item href="#!" className="dropdown-item">
                        <i className="ph-duotone ph-user-circle"></i>
                        <span>Users</span>
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown> */}
              {/* <Dropdown as="li" className="pc-h-item d-none d-md-inline-flex">
                <Dropdown.Toggle
                  as="a"
                  className="pc-head-link arrow-none me-0"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="false"
                  aria-expanded="false"
                >
                  <i className="ph-duotone ph-sun-dim"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
                  <Dropdown.Item
                    onClick={() => handleThemeChange(THEME_MODE.DARK)}
                  >
                    <i className="ph-duotone ph-moon"></i>
                    <span>Dark</span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleThemeChange(THEME_MODE.LIGHT)}
                  >
                    <i className="ph-duotone ph-sun-dim"></i>
                    <span>Light</span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleThemeChange(THEME_MODE.DEFAULT)}
                  >
                    <i className="ph-duotone ph-cpu"></i>
                    <span>Default</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown> */}

              {/* <Dropdown as="li" className="pc-h-item d-none d-md-inline-flex">
                <Dropdown.Toggle
                  as="a"
                  className="pc-head-link head-link-primary dropdown-toggle arrow-none me-0"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="false"
                  aria-expanded="false"
                >
                  <i className="ph-duotone ph-translate"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown lng-dropdown">
                  {[
                    { code: "en", name: "English", description: "UK" },
                    { code: "fr", name: "français", description: "French" },
                    { code: "ro", name: "Română", description: "Romanian" },
                    { code: "cn", name: "中国人", description: "Chinese" },
                  ].map((lang) => (
                    <Dropdown.Item
                      key={lang.code}
                      href="#!"
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span>
                        {lang.name} <small>({lang.description})</small>
                      </span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown> */}

              {/* <li className="pc-h-item">
                <a
                  className="pc-head-link pct-c-btn"
                  onClick={handleOffcanvasToggle}
                  href="#"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvas_pc_layout"
                >
                  <i className="ph-duotone ph-gear-six"></i>
                </a>
              </li> */}
              {/* <Dropdown as="li" className="pc-h-item">
                <Dropdown.Toggle
                  as="a"
                  className="pc-head-link arrow-none me-0"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="false"
                  aria-expanded="false"
                >
                  <i className="ph-duotone ph-diamonds-four"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
                  <Dropdown.Item>
                    <i className="ph-duotone ph-user"></i>
                    <span>My Account</span>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="ph-duotone ph-gear"></i>
                    <span>Settings</span>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="ph-duotone ph-lifebuoy"></i>
                    <span>Support</span>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="ph-duotone ph-lock-key"></i>
                    <span>Lock Screen</span>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="ph-duotone ph-power"></i>
                    <span>Logout</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown> */}
              <AlertBell />
              <Dropdown as="li" className="pc-h-item header-user-profile">
                <Dropdown.Toggle
                  className="pc-head-link arrow-none me-0 rounded-circle"
                  data-bs-toggle="dropdown"
                  href="#"
                  aria-haspopup="false"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                  style={{
                    border: "none",
                    // background: "#12206c",
                    color: "white",
                    // height: "2.2rem",
                    // width: "2.2rem",
                  }}
                >
                  {/* <Image
                    src={avatar2}
                    alt="user-image"
                    width={40}
                    className="user-avtar"
                  /> */}

                  <Avatar sx={{ bgcolor: "#12206c" }}>
                    {session?.user ? (
                      session?.user.name[0]
                    ) : (
                      <UserRound color="white" />
                    )}
                  </Avatar>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-user-profile dropdown-menu-end pc-h-dropdown">
                  <div className="dropdown-body">
                    <SimpleBar
                      className="profile-notification-scroll position-relative"
                      style={{ maxHeight: "calc(100vh - 225px)" }}
                    >
                      <ul className="list-group list-group-flush w-100 pt-3">
                        <li className="list-group-item">
                          <div className="d-flex align-items-center">
                            {/* <div className="flex-shrink-0">
                              <Image
                                src={avatar2}
                                alt="user-image"
                                width={50}
                                className="wid-50 rounded-circle"
                              />
                            </div> */}
                            <div className="flex-grow-1 mx-3">
                              <h5 className="mb-1">
                                {session?.user ? (
                                  <div className="gap-2 d-flex">
                                    {session?.user.name}
                                    <small
                                      className="text-capitalize rounded"
                                      style={{
                                        background: "#12206c",
                                        color: "white",
                                        padding: "0.25rem",
                                      }}
                                    >
                                      {roleLabel(session?.user.role)}
                                    </small>
                                  </div>
                                ) : (
                                  <Skeleton height={32} animation="wave" />
                                )}
                              </h5>

                              {session?.user.email ? (
                                <a
                                  className="link-primary"
                                  href={`mailto:${session?.user.email}`}
                                >
                                  {session?.user.email}
                                </a>
                              ) : (
                                <Skeleton height={24} animation="wave" />
                              )}
                            </div>
                            {/* <span className="badge bg-primary">PRO</span> */}
                          </div>
                        </li>
                        <li className="list-group-item">
                          <Dropdown.Item>
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-user-circle"></i>
                              <span>Edit profile</span>
                            </span>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Button
                              variant="none"
                              onClick={() => openIntegrationModal("view")}
                              className="d-flex align-items-center p-0"
                              id="manage-integrations-button"
                            >
                              <Cable size={32} />
                              <span className="ms-2">Manage Integrations</span>
                            </Button>
                          </Dropdown.Item>
                          <Dropdown.Item style={{ paddingBlock: 0 }}>
                            {/* <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-gear-six"></i>
                              <span>Settings</span>
                            </span> */}
                            <button
                              className="pc-head-link pct-c-btn ph-gear-six d-flex justify-content-start border-0"
                              style={{ padding: 0, margin: 0, width: "100%" }}
                              onClick={handleOffcanvasToggle}
                              data-bs-toggle="offcanvas"
                              data-bs-target="#offcanvas_pc_layout"
                            >
                              <i className="ph-duotone ph-gear-six"></i>
                              <span>Settings</span>
                            </button>
                          </Dropdown.Item>
                        </li>
                        {/* <li className="list-group-item">
                          <Dropdown.Item>
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-heart"></i>
                              <span>Favorite</span>
                            </span>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-arrow-circle-down"></i>
                              <span>Download</span>
                            </span>
                            <span className="avtar avtar-xs rounded-circle bg-danger text-white">
                              10
                            </span>
                          </Dropdown.Item>
                        </li> */}
                        {/* <li className="list-group-item">
                          <div className="dropdown-item">
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-globe-hemisphere-west"></i>
                              <span>Languages</span>
                            </span>
                            <span className="flex-shrink-0">
                              <select className="form-select bg-transparent form-select-sm border-0 shadow-none">
                                <option value="1">English</option>
                                <option value="2">Spain</option>
                                <option value="3">Arbic</option>
                              </select>
                            </span>
                          </div>
                          <Dropdown.Item>
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-flag"></i>
                              <span>Country</span>
                            </span>
                          </Dropdown.Item>
                          <div className="dropdown-item">
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-moon"></i>
                              <span>Dark mode</span>
                            </span>
                            <div className="form-check form-switch form-check-reverse m-0">
                              <input
                                className="form-check-input f-18"
                                id="dark-mode"
                                type="checkbox"
                                role="switch"
                              />
                            </div>
                          </div>
                        </li> */}
                        <li className="list-group-item">
                          <Dropdown.Item>
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-plus-circle"></i>
                              <span>Add account</span>
                            </span>
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => signOut()}>
                            <span className="d-flex align-items-center">
                              <i className="ph-duotone ph-power"></i>
                              <span>Logout</span>
                            </span>
                          </Dropdown.Item>
                        </li>
                      </ul>
                    </SimpleBar>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ul>
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default TopBar;
