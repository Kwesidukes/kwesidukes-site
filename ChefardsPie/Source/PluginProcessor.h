#pragma once

#include <JuceHeader.h>

/**
    Alpha 0.1 instrument shell.

    This milestone intentionally contains no synthesis or DSP yet: it exists to
    prove the plugin loads as a synth instrument in Ableton Live (VST3/AU) and
    Standalone, accepts MIDI, and produces silence without crashing or leaking.
    Synth engine, parameters (APVTS), and effects are added in later milestones.
*/
class ChefardsPieAudioProcessor final : public juce::AudioProcessor
{
public:
    ChefardsPieAudioProcessor();
    ~ChefardsPieAudioProcessor() override;

    //==============================================================================
    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;
    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    //==============================================================================
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    //==============================================================================
    const juce::String getName() const override;
    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    //==============================================================================
    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    //==============================================================================
    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

private:
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ChefardsPieAudioProcessor)
};
