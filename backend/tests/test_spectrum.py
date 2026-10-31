"""
Unit tests for the Orbitron Spectrum Analysis Engine.
"""

import unittest
from backend.spectrum_engine import analyze_spectrum, generate_demo_spectrum

class TestSpectrumEngine(unittest.TestCase):
    def test_flat_spectrum_produces_no_candidates(self):
        flat = generate_demo_spectrum("flat")
        result = analyze_spectrum(
            flat["wavelengths"],
            flat["depths"],
            flat["errors"],
            detection_threshold_sigma=3.5
        )
        # Flat spectrum should have zero or minimal false positive candidate peaks
        candidates = [c for c in result["candidates"] if c["status"] == "candidate"]
        self.assertEqual(len(candidates), 0, f"Expected 0 candidates for flat spectrum, got {candidates}")

    def test_co2_detection_at_4_3_um(self):
        demo = generate_demo_spectrum("wasp_39b_real_reference")
        result = analyze_spectrum(
            demo["wavelengths"],
            demo["depths"],
            demo["errors"]
        )
        candidates = [c for c in result["candidates"] if c["status"] == "candidate"]
        self.assertGreater(len(candidates), 0, "Expected at least 1 candidate detected")
        
        # Check that CO2 is detected near 4.3 um with high significance (> 5 sigma)
        co2_detections = [
            c for c in candidates 
            if c["matched_molecule"] == "CO2" and abs(c["wavelength_um"] - 4.30) <= 0.15
        ]
        self.assertTrue(len(co2_detections) >= 1, f"CO2 not detected near 4.3 um. Detected: {candidates}")
        self.assertGreater(co2_detections[0]["significance_sigma"], 5.0)

    def test_scientific_notice_present(self):
        demo = generate_demo_spectrum("wasp_39b_real_reference")
        result = analyze_spectrum(demo["wavelengths"], demo["depths"])
        self.assertIn("scientific_notice", result)
        self.assertIn("Detecting a gas is not detecting life", result["scientific_notice"])

if __name__ == "__main__":
    unittest.main()
