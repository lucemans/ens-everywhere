console.log("ENS Everywhere LOADED");

let searchMatches = [
    "input#search-panel",
    "input#txtSearchAddressOrDomainName",
    "input#txtSearchInput"
];

let search = searchMatches.reduce((acc, selector) => {
    let elements = document.querySelectorAll(selector);
    if (elements.length) {
        acc.push(elements);
    }
    return acc;
}, []);

if (search.length > 0) {
    console.log("ENS Everywhere: search panel found");

    // Add a style tag to the page
    const style = document.createElement("style");

    style.textContent = `
      #search-panel {
        background: hotpink !important;
      }
      #txtSearchAddressOrDomainName {
        background: hotpink !important;
      }
    `;

    document.head.appendChild(style);
}

// Regex that matches any domain name in the format of `luc.eth` `hello.com` `world.luc.xyz` etc.
const name_regex = /([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/;

// Ethereum Regex
const ethereum_address_regex = /^0x[a-fA-F0-9]{40}$/;

search.forEach((search_elements) => {
    console.log(search_elements);
    search_elements.forEach((search_element) => {
        search_element.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();

                console.log("SUBMITTED " + event.target.value);

                const name = event.target.value;

                if (name.match(name_regex)) {
                    console.log("ENS Everywhere: name matches regex");
                }

                (async () => {
                    // Fetch `https://enstate.rs/n/<name>`
                    const result = await fetch(`https://enstate.rs/n/${name}`);

                    if (result.status !== 200) {
                        console.log("ENS Everywhere: name not found");
                    }

                    const data = await result.json();

                    console.log(data);

                    const address = data["address"];

                    if (!address) {
                        return;
                    }

                    console.log("ENS Everywhere: address found", address);

                    // Redirect to `https://<domain>/address/<address>`
                    const domain = window.location.hostname;

                    window.location.href = `https://${domain}/address/${address}`;
                })();
                return;
            }

            console.log(
                "ENS Everywhere: search input changed",
                event.target.value,
            );
            console.log(event);
        });
    });
});

// Translate Addresses to ENS Names

/**
 * Etherscan Address Translation
 * On etherscan addresses are displayed as `0x123...456`
 *
 * Strategy 1:
 *   span.hash-tag.text-truncate + a[data-clipboard-text]
 *   We can then extract the data-clipboard-text, and translate it to an ENS name
 *   We can then replace the text of the span.hash-tag with the ENS name
 *
 * Strategy 2:
 *   a.hash-tag.text-truncate[href]
 *   where the href is for example `/address/0x225f137127d9067788314bc7fcc1f36746a3c3B5`
 *   We can then extract the address from the href, and translate it to an ENS name
 *
 * Strategy 3:
 *   span[data-bs-title]
 *   where data-bs-title matches 0x225f137127d9067788314bc7fcc1f36746a3c3B5
 *   We can then extract the address from the data-bs-title, and translate it to an ENS name
 *
 * Strategy 4:
 *   span.hash-tag.text-truncate
 *   where the text matches an address such as 0x225f137127d9067788314bc7fcc1f36746a3c3B5 (ethereum address regex)
 *   We can then extract the address from the text, and translate it to an ENS name
 */
function translateEtherscanAddresses2ENS() {
    // Get all the address elements
    const addressElements = document.querySelectorAll(
        "td > div > span.hash-tag.text-truncate + a[data-clipboard-text]",
    );

    // Loop through them
    addressElements.forEach((addressElement) => {
        // Get the address
        const address = addressElement.getAttribute("data-clipboard-text");

        // Fetch `https://enstate.rs/a/<address>`
        fetch(`https://enstate.rs/a/${address}`)
            .then((response) => response.json())
            .then((data) => {
                // Get the ENS name
                const name = data["name"];

                // If there is no ENS name, return
                if (!name) {
                    return;
                }

                // Replace the address with the ENS name
                let parent = addressElement.parentElement;
                parent.querySelector(
                    "span.hash-tag.text-truncate",
                ).textContent = name;
            })
            .catch((error) => {
                console.log(error);
            });
    });

    // Get all the address elements
    const addressElements2 = document.querySelectorAll(
        "td > div > a.hash-tag.text-truncate[href]",
    );

    // Loop through them
    addressElements2.forEach((addressElement) => {
        // Get the href
        const href = addressElement.getAttribute("href");

        // Get the address from the href
        const address = href.split("/")[2];

        // Fetch `https://enstate.rs/a/<address>`
        fetch(`https://enstate.rs/a/${address}`)
            .then((response) => response.json())
            .then((data) => {
                // Get the ENS name
                const name = data["name"];

                // If there is no ENS name, return
                if (!name) {
                    return;
                }

                // Replace the address with the ENS name
                addressElement.textContent = name;
            })
            .catch((error) => {
                console.log(error);
            });
    });

    // Strategy 3
    // Get all the address elements
    const addressElements3 = document.querySelectorAll(
        "td > div > span[data-bs-title]",
    );

    // Loop through them
    addressElements3.forEach((addressElement) => {
        // Get the data-bs-title
        const dataBsTitle = addressElement.getAttribute("data-bs-title");

        // Get the address from the data-bs-title
        const address = dataBsTitle;

        // Fetch `https://enstate.rs/a/<address>`
        fetch(`https://enstate.rs/a/${address}`)
            .then((response) => response.json())
            .then((data) => {
                // Get the ENS name
                const name = data["name"];

                // If there is no ENS name, return
                if (!name) {
                    return;
                }

                // Replace the address with the ENS name
                addressElement.textContent = name;
            })
            .catch((error) => {
                console.log(error);
            });
    });

    // Strategy 4
    // Get all the address elements
    const addressElements4 = document.querySelectorAll(
        ".hash-tag.text-truncate",
    );

    // Loop through them
    addressElements4.forEach((addressElement) => {
        // Get the text
        const text = addressElement.textContent;

        // If the text is not an ethereum address, return
        if (!text.match(ethereum_address_regex)) {
            return;
        }

        // Get the address from the text
        const address = text;

        // Fetch `https://enstate.rs/a/<address>`
        fetch(`https://enstate.rs/a/${address}`)
            .then((response) => response.json())
            .then((data) => {
                // Get the ENS name
                const name = data["name"];

                // If there is no ENS name, return
                if (!name) {
                    return;
                }

                // Replace the address with the ENS name
                addressElement.textContent = name;
            })
            .catch((error) => {
                console.log(error);
            });
    });
}

translateEtherscanAddresses2ENS();
