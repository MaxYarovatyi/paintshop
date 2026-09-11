import type { Variants } from "motion";
export const fadeUp :Variants = {
    hidden: {opacity: 0, y: 12},
    visible: {opacity: 1, y: 0, transition: {duration: 0.4, ease: "easeOut"}}
};

export const staggerChildren = {
    visible: {transition: {staggerChildren: 0.06}},
}