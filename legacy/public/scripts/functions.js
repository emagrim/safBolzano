function getSection(n) {
    if (n == 0) {
        var allSections = document.querySelectorAll("section[id^='section']");
        allSections.forEach(function (section) {
            section.style.display = "none";
        });
    } else {
        try {
            var section = document.getElementById("section" + n);
            section.style.display = "block";

            for (var i = 1; i <= 5; i++) {
                if (i != n) {
                    var otherSection = document.getElementById("section" + i);
                    otherSection.style.display = "none";
                }
            }
        }catch{
            console.log("No section found");
        }

        try {
            let buttons = document.querySelectorAll(".btn-app-sect" + n);
            buttons.forEach(function (button) {
                button.classList.add("active");
            });

            for (var i = 1; i <= 5; i++) {
                if (i != n) {
                    var otherButton = document.querySelectorAll(".btn-app-sect" + i);
                    otherButton.forEach(function(btn) {
                        btn.classList.remove("active");
                    });
                }
            }
            return section;
        } catch {
            console.log("No buttons found");
        }
        return section;
    }
}
