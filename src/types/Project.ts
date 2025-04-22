import type { Link } from "./Link";

export interface Project {
    title: string;
    links: Array<Link>;
    description: string;
    primaryLanguage: string;
    openSource: boolean;
}