(function ($) {
    "use strict";

    // data background
    $("[data-background]").each(function () {
        $(this).css({
            "background-image": "url(" + $(this).data("background") + ")",
        });
    });

    // collapse
    $(".collapse")
        .on("shown.bs.collapse", function () {
            $(this)
                .parent()
                .find(".ti-plus")
                .removeClass("ti-plus")
                .addClass("ti-minus");
        })
        .on("hidden.bs.collapse", function () {
            $(this)
                .parent()
                .find(".ti-minus")
                .removeClass("ti-minus")
                .addClass("ti-plus");
        });

    // match height
    $(".match-height").matchHeight({
        byRow: true,
        property: "height",
        target: null,
        remove: false,
    });
})(jQuery);

$(".paste-btn").click(function () {
    let targetInput = $(this).data("target"); // Get associated input field
    let button = $(this); // Store reference to the button

    navigator.clipboard.readText().then(function (text) {
        let inputField = $(`input[data-id="${targetInput}"]`);
        inputField.val(text); // Paste clipboard content

        updateIcon(inputField, button); // Update button icon based on input value
    }).catch(function (err) {
        console.error("Failed to read clipboard: ", err);
    });
});

// Function to update the button icon based on input value
function updateIcon(inputField, button) {
    if (inputField.val().trim() !== "") {
        // Show cancel (X) icon if input has value
        button.html('<svg width="22" height="22" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L12 12M12 3L3 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        
        // Add click event to clear input
        button.off("click").on("click", function () {
            inputField.val(""); // Clear input field
            updateIcon(inputField, button); // Update icon again
        });
    } else {
        // Show original clipboard icon if input is empty
        button.html(`<svg width="22" height="22" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5951 2.00008H11.9284C12.282 2.00008 12.6211 2.14056 12.8712 2.39061C13.1212 2.64065 13.2617 2.97979 13.2617 3.33341V14.0001C13.2617 14.3537 13.1212 14.6928 12.8712 14.9429C12.6211 15.1929 12.282 15.3334 11.9284 15.3334H2.59505C2.24143 15.3334 1.90229 15.1929 1.65224 14.9429C1.40219 14.6928 1.26172 14.3537 1.26172 14.0001V3.33341C1.26172 2.97979 1.40219 2.64065 1.65224 2.39061C1.90229 2.14056 2.24143 2.00008 2.59505 2.00008H3.92839M10.5951 2.00008C10.5951 2.73646 9.9981 3.33341 9.26172 3.33341H5.26172C4.52534 3.33341 3.92839 2.73646 3.92839 2.00008M10.5951 2.00008C10.5951 1.2637 9.9981 0.666748 9.26172 0.666748H5.26172C4.52534 0.666748 3.92839 1.2637 3.92839 2.00008M4.59505 7.33341H9.92839M4.59505 10.6667H9.92839" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`);

        // Reset event handler for pasting
        button.off("click").on("click", function () {
            let targetInput = $(this).data("target");
            let inputField = $(`input[data-id="${targetInput}"]`);

            navigator.clipboard.readText().then(function (text) {
                inputField.val(text);
                updateIcon(inputField, button);
            }).catch(function (err) {
                console.error("Failed to read clipboard: ", err);
            });
        });
    }
}

// Monitor input changes to update the icon dynamically
$("input").on("input", function () {
    let inputField = $(this);
    let targetId = inputField.data("id");
    let button = $(`.paste-btn[data-target="${targetId}"]`);
    updateIcon(inputField, button);
});

function getRandomBigInt(min, max) {
  min = BigInt(min);
  max = BigInt(max);
  const range = max - min + 1n;
  const randomBigInt = min + (BigInt(Math.floor(Math.random() * Number(range))));
  return randomBigInt;
}

$(document).ready(function () {
    $(".header-form-main").on("submit", function (event) {
        event.preventDefault(); // Prevent the form from submitting traditionally

        $.ajax({
            url: "/search", // Route to submit the form
            method: "POST",
            data: $(this).serialize(), // Serialize the form data
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"), // Include CSRF token
            },
            beforeSend: function () {
                $(".video-loader").show();
                $(".show-errors").hide().html(""); // Clear previous errors
            },
            success: function (response) {
                $(".video-loader").hide();

                if (response.error) {
                    $(".show-errors").html(response.error).show();
                } else {
                    $(".form-section").remove();
                    $(".result-data").html(response);
                    $("html, body").animate(
                        {
                            scrollTop: $(".result-data").offset().top,
                        },
                        1000
                    );
                }
            },
            error: function (xhr) {
                $(".video-loader").hide();
                
                let errorMessage = "An unexpected error occurred.";
                
                if (xhr.status === 400 || xhr.status === 500) {
                    let response = xhr.responseJSON;
                    if (response && response.error) {
                        errorMessage = response.error;
                    }
                }

                $(".show-errors").html(errorMessage).show();
            },
        });
    });
});


$(document).on('click', '.download-btns', function () {
  $(this).text('Downloading...').attr('disabled', 'disabled');
  let btn = $(this);
  let url = btn.data('url');
  let textvar = btn.data('text');
  let vidname = btn.data('name');
  let ext = btn.data('ext');
  let randomInt = getRandomBigInt(111111111111111111111111111111, 999999999999999999999999999999);
  downVideo(url, vidname+'_'+randomInt+'.'+ext,  btn, textvar);
});

function downVideo(url, name, btn, textvar) {
    $('.progress-bar-bottom').show();

    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');
    let progress = 0;

    // Simulate progress
    function simulateProgress() {
        if (progress < 100) {
            if (progress < 10) {
                progress = 10; // Initial increment to 10%
            } else if (progress < 50) {
                progress = 50; // Middle progress to 50%
            } else if (progress < 70) {
                progress = 70; // Further progress to 70%
            } else {
                progress = 100; // Complete progress to 100%
            }

            progressBar.value = progress;
            progressLabel.textContent = progress + '%';

            if (progress < 100) {
                setTimeout(simulateProgress, 500); // Adjust the delay for smooth animation
            }
        }
    }

    simulateProgress();

    // Actual download logic
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let blob = this.response;
            let u = window.URL.createObjectURL(new Blob([blob]));
            let a = document.createElement('a');
            a.download = name;
            a.href = u;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Ensure progress bar reaches 100% on completion
            progress = 100;
            progressBar.value = progress;
            progressLabel.textContent = progress + '%';

            $('.progress-bar-bottom').hide();
            btn.text(textvar).removeAttr('disabled');
        }
    };

    xhr.onerror = function () {
        console.error('An error occurred during the download.');
        $('.progress-bar-bottom').hide();
        btn.text('Retry').removeAttr('disabled');
    };

    xhr.send();
}

$(document).on('click', '.reload-more', function (e) {
    window.scrollTo(0, 0);
    // Reload the current page
    setTimeout(function() {
        location.reload();
    }, 0);
})

$(function(){
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');
  
    $('.nav-tabs a').click(function (e) {
      $(this).tab('show');
      var scrollmem = $('body').scrollTop();
      window.location.hash = this.hash;
      $('html,body').scrollTop(scrollmem);
    });
  });