layout = {
    "GrandRoyalLayoutClassics": 900,
    "GrandRoyalLayoutMultipage": 800,
    "GrandRoyalLayoutMultipageSideNav": 800,
    "GrandRoyalLayoutSingle": 800,
    "GrandRoyalLayoutSingleSimple": 800,
    "GrandRoyalLayoutSingleSwish": 776,
    "GrandRoyalLayoutTiles": 700,
}

if(layout[UMGGR_Mobile_classes] != undefined){
    breakpoint = layout[UMGGR_Mobile_classes];
}else {
    //default breakpoint if a new layout is used
    breakpoint = 800;
}

class MobileClasses {

    constructor(breakpoint) {
        this.breakpoint = breakpoint;
        this.updateBodyClass();
        window.addEventListener('resize', () => this.updateBodyClass());
    }

    updateBodyClass() {
        const width = window.innerWidth;

        if (width > this.breakpoint) {
            document.body.classList.remove('umggr-mobile-view');
            document.body.classList.add('umggr-desktop-view');
        } else {
            document.body.classList.remove('umggr-desktop-view');
            document.body.classList.add('umggr-mobile-view');
        }
    }
}

new MobileClasses(breakpoint);