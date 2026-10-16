import React from 'react';
import FadeIn from './FadeIn';
import StaggerContainer from './StaggerContainer';
import Card from './components/ui/Card';

const AnimationExamples = () => {
  const services = [
    {
      id: 1,
      title: 'Paint Protection Film (PPF)',
      description: 'Ultimate protection for your vehicle\'s paintwork with self-healing technology.',
      icon: '🛡️',
    },
    {
      id: 2,
      title: 'Window Tinting',
      description: 'Professional window tinting for heat rejection and UV protection.',
      icon: '🚗',
    },
    {
      id: 3,
      title: 'Paint Correction',
      description: 'Restore your paint to showroom condition with our expert correction services.',
      icon: '✨',
    },
    {
      id: 4,
      title: 'Nano Ceramic Coating',
      description: 'Long-lasting hydrophobic coating for superior protection and shine.',
      icon: '🔬',
    },
    {
      id: 5,
      title: 'Dash Cam Installation',
      description: 'Professional installation of front and rear dash cameras.',
      icon: '📹',
    },
    {
      id: 6,
      title: 'Detailing Services',
      description: 'Comprehensive interior and exterior detailing for your vehicle.',
      icon: '🧹',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="down" className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Professional automotive protection and detailing services to keep your vehicle looking its best.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white mb-2">
              Staggered Grid Animation
            </h2>
            <p className="text-gray-400">
              Cards animate sequentially as they enter the viewport
            </p>
          </div>
        </FadeIn>

        <StaggerContainer
          staggerDelay={0.1}
          initialDelay={0.3}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
            <Card key={service.id} variant="elevated" className="cursor-pointer">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </Card>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.5} className="mt-16">
          <div className="border-t border-white/10 pt-8">
            <h2 className="text-3xl font-semibold text-white mb-4 text-center">
              Individual Card Animations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FadeIn direction="left" delay={0.6}>
                <Card variant="outline" padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🎯</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Precision
                      </h3>
                      <p className="text-gray-400">
                        Every application is executed with meticulous attention to detail.
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeIn>

              <FadeIn direction="right" delay={0.7}>
                <Card variant="outline" padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⚡</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Efficiency
                      </h3>
                      <p className="text-gray-400">
                        Quick turnaround times without compromising on quality.
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeIn>

              <FadeIn direction="left" delay={0.8}>
                <Card variant="outline" padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🏆</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Quality
                      </h3>
                      <p className="text-gray-400">
                        Premium materials and professional installation guaranteed.
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeIn>

              <FadeIn direction="right" delay={0.9}>
                <Card variant="outline" padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">💎</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Excellence
                      </h3>
                      <p className="text-gray-400">
                        Exceeding expectations with every project we undertake.
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={1.0} direction="up" className="mt-16 text-center">
          <Card variant="highlighted" padding="lg">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-gray-300 mb-6">
              Contact us today for a free consultation and quote
            </p>
            <button className="bg-[#FF5C35] hover:bg-[#FF7A5C] text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300">
              Book Now
            </button>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default AnimationExamples;
