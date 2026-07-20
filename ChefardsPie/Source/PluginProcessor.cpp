#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
ChefardsPieAudioProcessor::ChefardsPieAudioProcessor()
    : AudioProcessor (BusesProperties()
                          .withOutput ("Output", juce::AudioChannelSet::stereo(), true))
{
}

ChefardsPieAudioProcessor::~ChefardsPieAudioProcessor() = default;

//==============================================================================
void ChefardsPieAudioProcessor::prepareToPlay (double /*sampleRate*/, int /*samplesPerBlock*/)
{
    // Synth voices, envelopes, filters, and the FX chain are prepared here
    // starting in the milestone that introduces them.
}

void ChefardsPieAudioProcessor::releaseResources()
{
}

bool ChefardsPieAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    // No input bus: this is an instrument. Output must be mono or stereo.
    if (! layouts.getMainInputChannelSet().isDisabled())
        return false;

    const auto mainOutput = layouts.getMainOutputChannelSet();
    return mainOutput == juce::AudioChannelSet::mono()
        || mainOutput == juce::AudioChannelSet::stereo();
}

void ChefardsPieAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;

    // Alpha 0.1 shell: consume MIDI (so hosts see the plugin as MIDI-responsive)
    // and output silence. No allocation, locking, or I/O happens here, keeping
    // this real-time safe as required from the first milestone onward.
    midiMessages.clear();
    buffer.clear();
}

//==============================================================================
juce::AudioProcessorEditor* ChefardsPieAudioProcessor::createEditor()
{
    return new ChefardsPieAudioProcessorEditor (*this);
}

bool ChefardsPieAudioProcessor::hasEditor() const
{
    return true;
}

//==============================================================================
const juce::String ChefardsPieAudioProcessor::getName() const
{
    return JucePlugin_Name;
}

bool ChefardsPieAudioProcessor::acceptsMidi() const
{
    return true;
}

bool ChefardsPieAudioProcessor::producesMidi() const
{
    return false;
}

bool ChefardsPieAudioProcessor::isMidiEffect() const
{
    return false;
}

double ChefardsPieAudioProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

//==============================================================================
int ChefardsPieAudioProcessor::getNumPrograms()
{
    return 1;
}

int ChefardsPieAudioProcessor::getCurrentProgram()
{
    return 0;
}

void ChefardsPieAudioProcessor::setCurrentProgram (int /*index*/)
{
}

const juce::String ChefardsPieAudioProcessor::getProgramName (int /*index*/)
{
    return {};
}

void ChefardsPieAudioProcessor::changeProgramName (int /*index*/, const juce::String& /*newName*/)
{
}

//==============================================================================
void ChefardsPieAudioProcessor::getStateInformation (juce::MemoryBlock& /*destData*/)
{
    // Replaced with AudioProcessorValueTreeState::copyState() once parameters
    // (Parameters.h/.cpp) are introduced in the next milestone.
}

void ChefardsPieAudioProcessor::setStateInformation (const void* /*data*/, int /*sizeInBytes*/)
{
}

//==============================================================================
// This creates new instances of the plugin.
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new ChefardsPieAudioProcessor();
}
