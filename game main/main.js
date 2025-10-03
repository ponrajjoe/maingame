 
    let isMeasuring = false;

    document.getElementById('start-btn').addEventListener('click', () => {
      if (isMeasuring) return; // Prevent multiple clicks
      isMeasuring = true;

      document.getElementById('decibel-display').innerText = "Listening...";
      document.getElementById('result-display').innerText = "";

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);

          microphone.connect(analyser);

          analyser.fftSize = 2048;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new       (bufferLength);

          let highestDecibel = -Infinity;
          const startTime = Date.now();

          function measure() {
            analyser.getByteFrequencyData(dataArray);

            let sumSquares = 0;
            for (let i = 0; i < bufferLength; i++) {
              sumSquares += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sumSquares / bufferLength);
            const decibels = 20 * Math.log10(rms);

            if (isFinite(decibels)) {
              document.getElementById('decibel-display').innerText = decibels.toFixed(2) + " dB";
              if (decibels > highestDecibel) {
                highestDecibel = decibels;
              }
            } else {
              document.getElementById('decibel-display').innerText = "Silent...";
            }

            if (Date.now() - startTime < 5000) {
              requestAnimationFrame(measure);
            } else {
              document.getElementById('result-display').innerText =
                "🎉 Highest Decibel in 5 sec: " + highestDecibel.toFixed(2) + " dB";
              isMeasuring = false;
              stream.getTracks().forEach(track => track.stop()); // Stop mic
            }
          }

          measure();
        })
        .catch(function(err) {
          console.error('Error accessing microphone:', err);
          document.getElementById('decibel-display').innerText = "Microphone access denied!";
          isMeasuring = false;
        });
    });
  
