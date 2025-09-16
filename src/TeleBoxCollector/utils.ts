export function getHiddenElementSize(element: HTMLElement): {
    height: number;
    width: number;
} {
    const clone = element.cloneNode(true) as HTMLElement;

    clone.style.position = "absolute";
    clone.style.top = "-99999px";
    clone.style.float = "none";
    clone.style.visibility = "hidden";
    clone.style.display = "block";

    document.body.appendChild(clone);

    const rect = clone.getBoundingClientRect();

    document.body.removeChild(clone);

    return { height: rect.height, width: rect.width };
}
